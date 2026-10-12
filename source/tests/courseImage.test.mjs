import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { describe, it } from "node:test";
import {
  courseImageFallbacks,
  getCourseImageUrl,
} from "../src/utils/courseImage.js";

const courseNames = [
  "Programming Foundations",
  "Java",
  "Advanced Java",
  "Data Structures & Algorithms",
  "Python",
  "JavaScript",
  "React",
  "Node.js",
  "HTML",
  "CSS",
  "System Design",
  "AWS",
  "Azure",
  "Docker",
  "Kubernetes",
  "Terraform",
  "Python for AI",
  "Machine Learning",
  "Deep Learning",
  "Generative AI",
  "LLMs",
  "RAG",
  "AI Agents",
  "MLOps",
  "SQL",
  "Excel",
  "Power BI",
  "Tableau",
  "Databricks",
  "Ethical Hacking",
  "Network Security",
  "Cloud Security",
  "App Security",
  "SOC",
  "Penetration Testing",
  "SEO",
  "Google Ads",
  "Meta Ads",
  "Social Media",
  "Content Marketing",
  "Email Marketing",
  "Analytics",
  "Accounting",
  "Financial Modeling",
  "Investment",
  "Corporate Finance",
  "FinTech",
  "Resume",
  "Interviews",
  "Aptitude",
  "Communication",
  "LinkedIn",
  "Career Planning",
  "Git & GitHub",
  "CI/CD",
  "Digital Marketing Analytics",
  "Cloud & Deployment",
  "Industry Project",
];

describe("getCourseImageUrl", () => {
  it("resolves a distinct, existing bundled image for every catalog course", async () => {
    assert.equal(courseNames.length, 58);
    assert.deepEqual(Object.keys(courseImageFallbacks).sort(), [...courseNames].sort());

    const resolvedImages = courseNames.map((courseName) =>
      getCourseImageUrl(null, courseName)
    );
    assert.ok(new Set(resolvedImages).size > 55);

    for (const imageUrl of resolvedImages) {
      await access(new URL(`../public${imageUrl}`, import.meta.url));
    }
  });

  it("uses product logos for branded courses, even when the API image is missing or stale", () => {
    assert.equal(getCourseImageUrl(null, "Java"), "/images/course-logos/java.svg");
    assert.equal(
      getCourseImageUrl("/images/old-java.jpg", "Advanced Java"),
      "/images/course-logos/spring.svg"
    );
    assert.equal(getCourseImageUrl(null, "Google Ads"), "/images/course-logos/google-ads.svg");
    assert.equal(getCourseImageUrl(null, "Analytics"), "/images/analytics.svg");
  });

  it("normalizes known legacy paths, falls back for unknown local files, and preserves remote URLs", () => {
    assert.equal(
      getCourseImageUrl("images/react.png", "React"),
      "/images/course-logos/react.svg"
    );
    assert.equal(
      getCourseImageUrl("/react.png", "React"),
      "/images/course-logos/react.svg"
    );
    assert.equal(
      getCourseImageUrl("/images/not-a-real-image.png", "Accounting"),
      "/images/accounting.svg"
    );
    assert.equal(
      getCourseImageUrl("https://cdn.example.com/course.svg", "Accounting"),
      "https://cdn.example.com/course.svg"
    );
  });

  it("uses a generic illustration only when the course is unknown", async () => {
    const fallback = getCourseImageUrl(null, "Unlisted Course");
    assert.equal(fallback, "/images/programming-foundations.svg");
    await access(new URL(`../public${fallback}`, import.meta.url));
  });
});
