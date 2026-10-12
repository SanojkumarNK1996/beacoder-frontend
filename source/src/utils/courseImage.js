const courseImageAliases = {
  "java.png": "course-logos/java.svg",
  "advanced-java.png": "course-logos/spring.svg",
  "advanced-java.jpg": "course-logos/spring.svg",
  "python.svg": "course-logos/python.svg",
  "python-for-ai.svg": "course-logos/python.svg",
  "js.png": "course-logos/javascript.svg",
  "react.png": "course-logos/react.svg",
  "nodejs.png": "course-logos/nodejs.svg",
  "html.png": "course-logos/html5.svg",
  "css.png": "course-logos/css3.svg",
  "azure.svg": "course-logos/azure.svg",
  "docker.svg": "course-logos/docker.svg",
  "kubernetes.svg": "course-logos/kubernetes.svg",
  "terraform.svg": "course-logos/terraform.svg",
  "git-github.svg": "course-logos/github.svg",
  "linkedin.svg": "course-logos/linkedin.svg",
  "google-ads.svg": "course-logos/google-ads.svg",
  "meta-ads.svg": "course-logos/meta.svg",
};

const courseImageFallbacks = {
  "Programming Foundations": "programming-foundations.svg",
  Java: "course-logos/java.svg",
  "Advanced Java": "course-logos/spring.svg",
  "Data Structures & Algorithms": "dsa.png",
  Python: "course-logos/python.svg",
  JavaScript: "course-logos/javascript.svg",
  React: "course-logos/react.svg",
  "Node.js": "course-logos/nodejs.svg",
  HTML: "course-logos/html5.svg",
  CSS: "course-logos/css3.svg",
  "System Design": "system-design.svg",
  AWS: "aws.png",
  Azure: "course-logos/azure.svg",
  Docker: "course-logos/docker.svg",
  Kubernetes: "course-logos/kubernetes.svg",
  Terraform: "course-logos/terraform.svg",
  "Python for AI": "course-logos/python.svg",
  "Machine Learning": "machine-learning.svg",
  "Deep Learning": "deep-learning.svg",
  "Generative AI": "generative-ai.svg",
  LLMs: "llms.svg",
  RAG: "rag.svg",
  "AI Agents": "ai-agents.svg",
  MLOps: "mlops.svg",
  SQL: "sql.svg",
  Excel: "excel.svg",
  "Power BI": "power-bi.svg",
  Tableau: "tableau.svg",
  Databricks: "databricks.svg",
  "Ethical Hacking": "ethical-hacking.svg",
  "Network Security": "network-security.svg",
  "Cloud Security": "cloud-security.svg",
  "App Security": "app-security.svg",
  SOC: "soc.svg",
  "Penetration Testing": "penetration-testing.svg",
  SEO: "seo.svg",
  "Google Ads": "course-logos/google-ads.svg",
  "Meta Ads": "course-logos/meta.svg",
  "Social Media": "social-media.svg",
  "Content Marketing": "content-marketing.svg",
  "Email Marketing": "email-marketing.svg",
  Analytics: "analytics.svg",
  Accounting: "accounting.svg",
  "Financial Modeling": "financial-modeling.svg",
  Investment: "investment.svg",
  "Corporate Finance": "corporate-finance.svg",
  FinTech: "fintech.svg",
  Resume: "resume.svg",
  Interviews: "interviews.svg",
  Aptitude: "aptitude.svg",
  Communication: "communication.svg",
  LinkedIn: "course-logos/linkedin.svg",
  "Career Planning": "career-planning.svg",
  "Git & GitHub": "course-logos/github.svg",
  "CI/CD": "ci-cd.svg",
  "Digital Marketing Analytics": "digital-marketing-analytics.svg",
  "Cloud & Deployment": "cloud-deployment.svg",
  "Industry Project": "industry-project.svg",
};

const knownCourseImageFiles = new Set([
  "accounting.svg",
  "advanced-java.jpg",
  "advanced-java.png",
  "ai-agents.svg",
  "analytics.svg",
  "app-security.svg",
  "aptitude.svg",
  "aws.png",
  "azure.svg",
  "career-planning.svg",
  "ci-cd.svg",
  "cloud-deployment.svg",
  "cloud-security.svg",
  "communication.svg",
  "content-marketing.svg",
  "corporate-finance.svg",
  "course-logos/azure.svg",
  "course-logos/css3.svg",
  "course-logos/docker.svg",
  "course-logos/github.svg",
  "course-logos/google-ads.svg",
  "course-logos/google-analytics.svg",
  "course-logos/html5.svg",
  "course-logos/java.svg",
  "course-logos/javascript.svg",
  "course-logos/kubernetes.svg",
  "course-logos/linkedin.svg",
  "course-logos/meta.svg",
  "course-logos/nodejs.svg",
  "course-logos/python.svg",
  "course-logos/react.svg",
  "course-logos/spring.svg",
  "course-logos/terraform.svg",
  "css.png",
  "database.png",
  "databricks.svg",
  "deep-learning.svg",
  "digital-marketing-analytics.svg",
  "docker.svg",
  "dsa.png",
  "email-marketing.svg",
  "ethical-hacking.svg",
  "excel.svg",
  "financial-modeling.svg",
  "fintech.svg",
  "generative-ai.svg",
  "git-github.svg",
  "google-ads.svg",
  "html.png",
  "industry-project.svg",
  "interviews.svg",
  "investment.svg",
  "java.png",
  "js.png",
  "kubernetes.svg",
  "linkedin.svg",
  "llms.svg",
  "machine-learning.svg",
  "meta-ads.svg",
  "mlops.svg",
  "network-security.svg",
  "nodejs.png",
  "penetration-testing.svg",
  "power-bi.svg",
  "programming-foundations.svg",
  "python-for-ai.svg",
  "python.svg",
  "rag.svg",
  "react.png",
  "resume.svg",
  "seo.svg",
  "soc.svg",
  "social-media.svg",
  "sql.svg",
  "system-design.svg",
  "tableau.svg",
  "terraform.svg",
]);

const normalizeCourseName = (courseName) =>
  typeof courseName === "string" ? courseName.trim().toLowerCase() : "";

const courseImagesByName = new Map(
  Object.entries(courseImageFallbacks).map(([name, image]) => [
    normalizeCourseName(name),
    image,
  ])
);

/**
 * Resolve API course image values, using a course-specific local asset when the
 * API value is missing or no longer points to a bundled course image.
 */
export const getCourseImageUrl = (imageUrl, courseName) => {
  const courseFallback = courseImagesByName.get(normalizeCourseName(courseName));
  if (courseFallback?.startsWith("course-logos/")) {
    return `/images/${courseFallback}`;
  }

  if (typeof imageUrl === "string" && imageUrl.trim()) {
    const normalizedUrl = imageUrl.trim();
    if (/^(https?:)?\/\//i.test(normalizedUrl)) return normalizedUrl;

    const fileName = normalizedUrl
      .replace(/[?#].*$/, "")
      .replace(/^\/+/, "")
      .replace(/^images\//i, "");
    const normalizedFileName = fileName.toLowerCase();

    if (courseImageAliases[normalizedFileName]) {
      return `/images/${courseImageAliases[normalizedFileName]}`;
    }
    if (knownCourseImageFiles.has(normalizedFileName)) {
      return `/images/${fileName}`;
    }
  }

  return `/images/${courseFallback || "programming-foundations.svg"}`;
};

export { courseImageFallbacks };
