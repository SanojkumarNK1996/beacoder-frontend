import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createContext, SourceTextModule, SyntheticModule } from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { transformWithEsbuild } from "vite";

const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));
const baseUrl = "https://course-api.invalid";
const token = "test-token";
const activeCourse = { id: "course-1", courseName: "isActive course", isActive: true };
const invalidStatuses = [
  ["false", false],
  ["undefined", undefined],
  ["null", null],
  ["true string", "true"],
  ["false string", "false"],
  ["empty string", ""],
  ["one", 1],
  ["zero", 0],
  ["NaN", NaN],
  ["array", []],
  ["object", {}],
  ["boxed boolean", new Boolean(true)],
  ["symbol", Symbol("true")],
  ["bigint", 1n],
  ["function", () => true],
];

// Every load gets isolated mocks, module state, and browser globals.
async function loadModule(entry, mocks = {}, globals = {}) {
  const context = createContext({ console, ...globals });
  const modules = new Map();

  function synthetic(identifier, exports) {
    const names = Object.keys(exports);
    return new SyntheticModule(names, function () {
      for (const name of names) this.setExport(name, exports[name]);
    }, { context, identifier });
  }

  async function dependency(specifier, parent) {
    if (Object.hasOwn(mocks, specifier)) {
      const key = `mock:${specifier}`;
      if (!modules.has(key)) modules.set(key, synthetic(key, mocks[specifier]));
      return modules.get(key);
    }
    if (!specifier.startsWith(".")) {
      if (!modules.has(specifier)) {
        modules.set(specifier, synthetic(specifier, await import(specifier)));
      }
      return modules.get(specifier);
    }
    let filename = resolve(dirname(parent.identifier), specifier);
    if (!extname(filename)) {
      for (const extension of [".js", ".jsx"]) {
        try {
          await access(filename + extension);
          filename += extension;
          break;
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
        }
      }
    }
    return sourceModule(filename);
  }

  async function sourceModule(filename) {
    if (modules.has(filename)) return modules.get(filename);
    let code = await readFile(filename, "utf8");
    if (filename.endsWith(".jsx")) {
      ({ code } = await transformWithEsbuild(code, filename, {
        loader: "jsx",
        jsx: "automatic",
      }));
    }
    const module = new SourceTextModule(code, {
      context,
      identifier: filename,
      initializeImportMeta(meta) {
        meta.env = { VITE_BASE_URL: baseUrl };
      },
    });
    modules.set(filename, module);
    await module.link(dependency);
    return module;
  }

  const module = await sourceModule(resolve(sourceRoot, entry));
  await module.evaluate();
  return module.namespace;
}

function elements(tree, predicate) {
  const matches = [];
  function visit(node) {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!React.isValidElement(node)) return;
    if (predicate(node)) matches.push(node);
    visit(node.props.children);
  }
  visit(tree);
  return matches;
}

function button(tree) {
  const matches = elements(tree, (node) => node.type === "button");
  assert.equal(matches.length, 1);
  return matches[0];
}

function deferred() {
  let resolvePromise;
  let reject;
  const promise = new Promise((resolve, rejectPromise) => {
    resolvePromise = resolve;
    reject = rejectPromise;
  });
  return { promise, resolve: resolvePromise, reject };
}

const settle = () => new Promise((resolve) => setImmediate(resolve));

// Run the components' actual hook callbacks without a DOM or another library.
function hookHarness() {
  const slots = [];
  let cursor = 0;
  let effects = [];
  let writes = 0;
  const hooks = {
    ...React,
    default: React,
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) {
        slots[index] = { value: typeof initial === "function" ? initial() : initial };
      }
      return [slots[index].value, (next) => {
        writes++;
        slots[index].value = typeof next === "function" ? next(slots[index].value) : next;
      }];
    },
    useEffect(callback, dependencies) {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
        effects.push(() => {
          previous?.cleanup?.();
          slots[index] = { dependencies, cleanup: callback() };
        });
      }
    },
    useMemo(factory) {
      cursor++;
      return factory();
    },
  };
  return {
    hooks,
    get writes() { return writes; },
    render(Component, props = {}) {
      cursor = 0;
      const tree = Component(props);
      const pending = effects;
      effects = [];
      pending.forEach((effect) => effect());
      return tree;
    },
    unmount() {
      slots.forEach((slot) => slot?.cleanup?.());
    },
  };
}

const Loader = ({ text }) => React.createElement("p", { role: "status" }, text);
const Link = ({ to, children }) => React.createElement("a", { href: to }, children);

test("helper permits only the literal isActive: true", async () => {
  const { isCourseActive } = await loadModule("utils/courseAvailability.js");
  assert.equal(isCourseActive(activeCourse), true);
  for (const [name, isActive] of invalidStatuses) {
    assert.equal(isCourseActive({ isActive }), false, name);
  }
  for (const course of [undefined, null, false, true, 1, "true", [], {}, { Active: true }]) {
    assert.equal(isCourseActive(course), false, `invalid course: ${String(course)}`);
  }
  assert.equal(isCourseActive({ isActive: false, Active: true }), false);
});

async function enrollmentApi(options = {}) {
  const live = Object.hasOwn(options, "live") ? options.live : activeCourse;
  const { getError, postError } = options;
  const calls = [];
  const result = { success: true, message: "Enrolled" };
  const axios = {
    async get(...args) {
      calls.push(["GET", ...args]);
      if (getError) throw getError;
      return { data: { data: live } };
    },
    async post(...args) {
      calls.push(["POST", ...args]);
      if (postError) throw postError;
      return { data: result };
    },
  };
  const { enrollCourse } = await loadModule("api/CourseList.js", { axios: { default: axios } });
  return { enrollCourse, calls, result };
}

for (const [name, input, id] of [
  ["ID", "course-1", "course-1"],
  ["numeric ID", 42, 42],
  ["object id", activeCourse, "course-1"],
  ["object courseId", { courseId: "alias-1", isActive: true }, "alias-1"],
  ["object _id", { _id: "alias-2", isActive: true }, "alias-2"],
]) {
  test(`enrollment rechecks live status before POST for ${name}, preserving auth`, async () => {
    const { enrollCourse, calls, result } = await enrollmentApi();
    assert.equal(await enrollCourse(token, input), result);
    assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
      ["GET", `${baseUrl}/api/v1/courses/${id}`, { headers: { Authorization: `Bearer ${token}` } }],
      ["POST", `${baseUrl}/api/v1/user/${id}/enroll`, {}, { headers: { Authorization: `Bearer ${token}` } }],
    ]);
  });
}

test("enrollment rejects missing IDs without any API request", async () => {
  const { enrollCourse, calls } = await enrollmentApi();
  for (const input of [undefined, null, "", 0, {}, { isActive: true }]) {
    await assert.rejects(enrollCourse(token, input), /course ID is required/);
  }
  assert.deepEqual(calls, []);
});

test("enrollment rejects inactive or unknown object status before any API request", async () => {
  const { enrollCourse, calls } = await enrollmentApi();
  for (const [, isActive] of invalidStatuses) {
    await assert.rejects(enrollCourse(token, { id: "course-1", isActive }), /inactive|unavailable/);
  }
  await assert.rejects(enrollCourse(token, { id: "course-1", Active: true }), /inactive|unavailable/);
  assert.deepEqual(calls, []);
});

for (const [name, live] of [
  ...invalidStatuses.map(([name, isActive]) => [name, { id: "course-1", isActive }]),
  ["missing course", undefined],
  ["null course", null],
  ["missing status", { id: "course-1" }],
  ["Active alias", { id: "course-1", Active: true }],
]) {
  test(`enrollment fails closed for live ${name}, including stale active objects`, async () => {
    for (const input of ["course-1", activeCourse]) {
      const { enrollCourse, calls } = await enrollmentApi({ live });
      await assert.rejects(enrollCourse(token, input), /inactive|unavailable/);
      assert.equal(calls.length, 1);
      assert.equal(calls[0][0], "GET");
    }
  });
}

test("enrollment waits for the live GET before allowing POST", async () => {
  const request = deferred();
  const calls = [];
  const { enrollCourse } = await loadModule("api/CourseList.js", {
    axios: { default: {
      get: () => { calls.push("GET"); return request.promise; },
      post: async () => { calls.push("POST"); return { data: "enrolled" }; },
    } },
  });
  const enrollment = enrollCourse(token, activeCourse);
  assert.deepEqual(calls, ["GET"]);
  request.resolve({ data: { data: activeCourse } });
  assert.equal(await enrollment, "enrolled");
  assert.deepEqual(calls, ["GET", "POST"]);
});

test("enrollment propagates retrieval errors and never POSTs", async () => {
  const error = new Error("Course retrieval failed");
  const { enrollCourse, calls } = await enrollmentApi({ getError: error });
  await assert.rejects(enrollCourse(token, activeCourse), (received) => received === error);
  assert.deepEqual(calls.map(([method]) => method), ["GET"]);
});

test("enrollment propagates server rejection after live active status", async () => {
  const error = Object.assign(new Error("Server rejected enrollment"), { response: { status: 403 } });
  const { enrollCourse, calls } = await enrollmentApi({ postError: error });
  await assert.rejects(enrollCourse(token, activeCourse), (received) => received === error);
  assert.deepEqual(calls.map(([method]) => method), ["GET", "POST"]);
});

async function cardModule() {
  const navigation = [];
  const { NewCourseCard } = await loadModule("components/NewCourseCard.jsx", {
    "react-router-dom": { useNavigate: () => (path) => navigation.push(path) },
  });
  return { NewCourseCard, navigation };
}

for (const mode of ["Enroll", "Continue"]) {
  test(`${mode} card renders locked and guards clicks for every invalid status`, async () => {
    const { NewCourseCard, navigation } = await cardModule();
    let callbacks = 0;
    const courses = [
      ...invalidStatuses.map(([, isActive]) => ({ ...activeCourse, isActive })),
      { id: "course-1", courseName: "Unknown course" },
      { id: "course-1", Active: true },
      null,
    ];
    for (const course of courses) {
      const tree = NewCourseCard({
        course: course && { ...course, ...(mode === "Continue" ? { completionPercentage: 35 } : {}) },
        buttonText: mode,
        onButtonClick: () => { callbacks++; },
      });
      const control = button(tree);
      assert.equal(control.props.disabled, true);
      const markup = renderToStaticMarkup(tree);
      assert.match(markup, /<button[^>]*disabled=""/);
      assert.match(markup, /aria-label="[^"]* is locked"/);
      assert.match(markup, /Inactive — You Are Not Enrolled in This Learning Path/);
      assert.match(markup, />Locked<\/button>/);
      await control.props.onClick();
      const event = { currentTarget: { style: { background: "unchanged" } } };
      control.props.onMouseEnter(event);
      control.props.onMouseLeave(event);
      assert.equal(event.currentTarget.style.background, "unchanged");
    }
    assert.equal(callbacks, 0);
    assert.deepEqual(navigation, []);
  });
}

test("active callback returning false prevents navigation", async () => {
  const { NewCourseCard, navigation } = await cardModule();
  const received = [];
  const tree = NewCourseCard({
    course: activeCourse,
    buttonText: "Enroll",
    onButtonClick: async (course) => { received.push(course); return false; },
  });
  assert.equal(button(tree).props.disabled, false);
  assert.doesNotMatch(renderToStaticMarkup(tree), /disabled=""|Locked|You Are Not Enrolled in This Learning Path/);
  await button(tree).props.onClick();
  assert.deepEqual(received, [activeCourse]);
  assert.deepEqual(navigation, []);
});

test("active card waits for its callback and then navigates to course detail", async () => {
  const { NewCourseCard, navigation } = await cardModule();
  const callback = deferred();
  let received;
  const tree = NewCourseCard({
    course: activeCourse,
    onButtonClick: (course) => { received = course; return callback.promise; },
  });
  const click = button(tree).props.onClick();
  assert.equal(received, activeCourse);
  assert.deepEqual(navigation, []);
  callback.resolve(true);
  await click;
  assert.deepEqual(navigation, ["/courses/course-1"]);
});

test("active card without callback navigates in catalog and continue modes using ID aliases", async () => {
  const { NewCourseCard, navigation } = await cardModule();
  for (const course of [
    activeCourse,
    { courseId: "alias-1", isActive: true, completionPercentage: 35 },
    { _id: "alias-2", isActive: true },
  ]) {
    const tree = NewCourseCard({ course, buttonText: "Continue" });
    assert.equal(button(tree).props.disabled, false);
    await button(tree).props.onClick();
  }
  assert.deepEqual(navigation, ["/courses/course-1", "/courses/alias-1", "/courses/alias-2"]);
});

test("active card callback rejection prevents navigation", async () => {
  const { NewCourseCard, navigation } = await cardModule();
  const error = new Error("Enrollment rejected");
  const tree = NewCourseCard({
    course: activeCourse,
    onButtonClick: async () => { throw error; },
  });
  await assert.rejects(button(tree).props.onClick(), (received) => received === error);
  assert.deepEqual(navigation, []);
});

async function routeHarness(initialParams) {
  const hooks = hookHarness();
  let params = initialParams;
  const requests = [];
  const storageKeys = [];
  const { default: Route } = await loadModule("components/CourseAvailabilityRoute.jsx", {
    react: hooks.hooks,
    "react-router-dom": { Link, useParams: () => params },
    "../api/CourseDetailPage": {
      fetchCourseHeader: (id, auth) => {
        const request = deferred();
        requests.push({ id, auth, ...request });
        return request.promise;
      },
    },
    "./MainPageLoader": { default: Loader },
  }, {
    localStorage: { getItem: (key) => { storageKeys.push(key); return token; } },
  });
  const child = React.createElement("article", null, "Protected course content");
  return {
    hooks, requests, storageKeys, child,
    render: () => hooks.render(Route, { children: child }),
    setParams(next) { params = next; },
  };
}

for (const params of [{ id: "detail-1" }, { cId: "subtopic-1", tId: "topic-1", sId: "sub-1" }]) {
  test(`direct ${Object.hasOwn(params, "id") ? "detail" : "subtopic"} route loads live status with auth before exposing children`, async () => {
    const route = await routeHarness(params);
    assert.match(renderToStaticMarkup(route.render()), /Checking course availability/);
    assert.equal(route.requests.length, 1);
    assert.equal(route.requests[0].id, params.id || params.cId);
    assert.equal(route.requests[0].auth, token);
    assert.deepEqual(route.storageKeys, ["authToken"]);
    route.requests[0].resolve({ data: { data: activeCourse } });
    await settle();
    assert.equal(route.render(), route.child);
    assert.equal(route.requests.length, 1);
    route.hooks.unmount();
  });
}

test("direct route fails closed for inactive, missing, string and alias statuses", async () => {
  for (const course of [
    ...invalidStatuses.map(([, isActive]) => ({ isActive })),
    undefined, null, {}, { Active: true },
  ]) {
    const route = await routeHarness({ id: "locked-1" });
    route.render();
    route.requests[0].resolve({ data: { data: course } });
    await settle();
    const markup = renderToStaticMarkup(route.render());
    assert.match(markup, /Course locked/);
    assert.match(markup, /role="alert"/);
    assert.match(markup, /This course is inactive/);
    assert.match(markup, /href="\/courses"/);
    assert.doesNotMatch(markup, /Protected course content/);
    route.hooks.unmount();
  }
});

test("direct route retrieval error renders lock and never exposes children", async () => {
  const route = await routeHarness({ cId: "error-1" });
  route.render();
  route.requests[0].reject(new Error("Header unavailable"));
  await settle();
  const markup = renderToStaticMarkup(route.render());
  assert.match(markup, /Course locked/);
  assert.match(markup, /Course availability could not be verified/);
  assert.doesNotMatch(markup, /Protected course content/);
  route.hooks.unmount();
});

test("route changes hide previously active children until the new course is verified", async () => {
  const route = await routeHarness({ id: "old" });
  route.render();
  route.requests[0].resolve({ data: { data: activeCourse } });
  await settle();
  assert.equal(route.render(), route.child);
  route.setParams({ id: "new" });
  assert.match(renderToStaticMarkup(route.render()), /Checking course availability/);
  assert.equal(route.requests[1].id, "new");
  route.requests[1].resolve({ data: { data: { isActive: false } } });
  await settle();
  assert.match(renderToStaticMarkup(route.render()), /Course locked/);
  route.hooks.unmount();
});

for (const staleOutcome of ["active", "inactive", "error"]) {
  test(`route cancellation ignores stale ${staleOutcome} responses after switching courses`, async () => {
    const route = await routeHarness({ id: "old" });
    route.render();
    route.setParams({ cId: "new" });
    assert.match(renderToStaticMarkup(route.render()), /Checking course availability/);
    const writesBefore = route.hooks.writes;
    if (staleOutcome === "error") route.requests[0].reject(new Error("Stale error"));
    else route.requests[0].resolve({ data: { data: { isActive: staleOutcome === "active" } } });
    await settle();
    assert.equal(route.hooks.writes, writesBefore);
    assert.match(renderToStaticMarkup(route.render()), /Checking course availability/);
    route.requests[1].resolve({ data: { data: { isActive: false } } });
    await settle();
    assert.match(renderToStaticMarkup(route.render()), /Course locked/);
    route.hooks.unmount();
  });
}

test("late stale active response cannot unlock the new inactive course", async () => {
  const route = await routeHarness({ id: "old" });
  route.render();
  route.setParams({ id: "new" });
  route.render();
  route.requests[1].resolve({ data: { data: { isActive: false } } });
  await settle();
  assert.match(renderToStaticMarkup(route.render()), /Course locked/);
  const writesBefore = route.hooks.writes;
  route.requests[0].resolve({ data: { data: activeCourse } });
  await settle();
  assert.equal(route.hooks.writes, writesBefore);
  assert.match(renderToStaticMarkup(route.render()), /Course locked/);
  route.hooks.unmount();
});

test("unmounted route ignores pending header completion", async () => {
  for (const outcome of ["active", "error"]) {
    const route = await routeHarness({ id: "unmounted" });
    route.render();
    route.hooks.unmount();
    if (outcome === "error") route.requests[0].reject(new Error("Late error"));
    else route.requests[0].resolve({ data: { data: activeCourse } });
    await settle();
    assert.equal(route.hooks.writes, 0);
  }
});

test("curriculum tree and roadmap lock inactive courses and hide their descendants", async () => {
  const hooks = hookHarness();
  const courses = [
    { id: "active", courseName: "isActive course", isActive: true },
    { id: "inactive", courseName: "Inactive course", isActive: false },
    { id: "unknown", courseName: "Unknown course" },
    { id: "string", courseName: "String course", isActive: "true" },
    { id: "alias", courseName: "Alias course", Active: true },
  ].map((course) => ({
    ...course,
    topics: [{ id: `${course.id}-topic`, title: `${course.id} topic`, subtopics: [
      { id: `${course.id}-sub`, title: `${course.id} subtopic` },
    ] }],
  }));
  const program = { name: "Test program", courses };
  const curriculum = { careerDomains: [{ name: "Test domain", programs: [program] }], totals: {} };
  const apiCalls = [];
  const { default: Curriculum } = await loadModule("pages/Curriculum/Curriculum.jsx", {
    react: hooks.hooks,
    "../../components/Sidebar": { Sidebar: () => null },
    "../../components/TopBar": { TopBar: () => null },
    "../../components/MainPageLoader": { default: Loader },
    "../../api/Curriculum": {
      fetchCurriculum: async () => { apiCalls.push("tree"); return curriculum; },
      fetchCurriculumRoadmap: async () => { apiCalls.push("roadmap"); return {}; },
    },
    "../../utils/courseImage": { getCourseImageUrl: () => "/images/test.png" },
    "./Curriculum.css": {},
  });
  assert.match(renderToStaticMarkup(hooks.render(Curriculum)), /Loading curriculum/);
  await settle();
  let tree = hooks.render(Curriculum);
  assert.deepEqual(apiCalls, ["tree", "roadmap"]);
  const courseButtons = elements(tree, (node) =>
    node.type === "button" && node.props.className?.startsWith("tree-row") &&
    elements(node, (child) => child.type === "b" &&
      courses.some((course) => course.courseName === child.props.children)).length > 0);
  assert.equal(courseButtons.length, courses.length);
  const roadmapSteps = elements(tree, (node) =>
    node.type === "div" && node.props.className?.startsWith("roadmap-step"));
  assert.equal(roadmapSteps.length, courses.length);
  assert.equal(courseButtons[0].props.disabled, false);
  assert.equal(roadmapSteps[0].props.className.includes("locked"), false);
  for (let i = 1; i < courses.length; i++) {
    assert.equal(courseButtons[i].props.disabled, true);
    assert.match(renderToStaticMarkup(courseButtons[i]), /Inactive — Locked/);
    assert.match(roadmapSteps[i].props.className, /locked/);
    assert.match(renderToStaticMarkup(roadmapSteps[i]), /Inactive — You Are Not Enrolled in This Learning Path/);
    const writesBefore = hooks.writes;
    courseButtons[i].props.onClick();
    assert.equal(hooks.writes, writesBefore);
  }
  courseButtons[0].props.onClick();
  tree = hooks.render(Curriculum);
  let markup = renderToStaticMarkup(tree);
  assert.match(markup, /active topic/);
  for (const course of courses.slice(1)) {
    assert.ok(!markup.includes(`${course.id} topic`));
    assert.ok(!markup.includes(`${course.id} subtopic`));
  }
  const topicButton = elements(tree, (node) =>
    node.type === "button" && elements(node, (child) =>
      child.type === "span" && child.props.children === "active topic").length > 0);
  assert.equal(topicButton.length, 1);
  topicButton[0].props.onClick();
  markup = renderToStaticMarkup(hooks.render(Curriculum));
  assert.match(markup, /active subtopic/);
  assert.doesNotMatch(markup, />Enroll(?: now)?</i);
  hooks.unmount();
});

test("App gates both detail URLs and the direct subtopic URL with availability wrapper", async () => {
  const marker = () => null;
  const mocks = {
    "react-router-dom": { Routes: marker, Route: marker, Navigate: marker },
    "./components/ProtectedRoute": { default: marker },
    "./components/CourseAvailabilityRoute": { default: marker },
  };
  // Stub unrelated pages so the wiring test cannot load their APIs or browser dependencies.
  for (const path of [
    "./pages/SignUp/SignUp.jsx", "./pages/CourseDetail/CourseDetailPage.jsx",
    "./pages/CourseDetail/SubtopicContentPage.jsx", "./pages/CourseList/CourseList.jsx",
    "./pages/Login/Login.jsx", "./pages/Homepage.jsx", "./pages/LandingPage.jsx",
    "./pages/Assignment/AssignmentPage.jsx", "./pages/DiscussionPage.jsx",
    "./pages/Instructor/InstructorAssignments.jsx", "./pages/Instructor/InstructorAssignmentDetail.jsx",
    "./pages/Instructor/InstructorDiscussions.jsx", "./pages/Instructor/InstructorDiscussionDetail.jsx",
    "./pages/Instructor/PairProgramming.jsx", "./pages/Curriculum/Curriculum.jsx",
    "./pages/ContentEditor/ContentEditor.jsx", "./pages/Admin/UserManagement.jsx",
  ]) {
    mocks[path] = { default: () => null };
  }
  const Availability = () => null;
  mocks["./components/CourseAvailabilityRoute"] = { default: Availability };
  const { default: App } = await loadModule("App.jsx", mocks);
  const tree = App();
  for (const path of ["/courses/:id", "/courses/:id/topics", "/course/:cId/topic/:tId/sub/:sId"]) {
    const routes = elements(tree, (node) => node.props.path === path);
    assert.equal(routes.length, 1, path);
    const wrapper = routes[0].props.element.props.children;
    assert.equal(wrapper.type, Availability, path);
    assert.ok(React.isValidElement(wrapper.props.children), path);
  }
  const adminUsersRoute = elements(tree, (node) => node.props.path === "/admin/users");
  assert.equal(adminUsersRoute.length, 1);
  assert.equal(adminUsersRoute[0].props.element.props.requiredRole, "admin");
});
