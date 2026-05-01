// Mock AI service for generating job descriptions
// This will be replaced with actual backend AI engine later

const JOB_DESCRIPTION_TEMPLATES: Record<string, { template: string; keyPoints: string[] }> = {
  "Senior Frontend Developer": {
    template: "Lead frontend development initiatives and mentor junior developers. Build scalable, performant user interfaces using modern frameworks. Collaborate with UX/design teams to implement pixel-perfect designs.",
    keyPoints: [
      "Design and implement reusable component libraries",
      "Lead code reviews and establish best practices",
      "Mentor junior and mid-level developers",
      "Optimize application performance and Core Web Vitals",
      "Collaborate with product and design teams on feature specifications",
    ],
  },
  "Frontend Developer": {
    template: "Develop and maintain user-facing features using modern web technologies. Work closely with designers and backend engineers to deliver high-quality interfaces.",
    keyPoints: [
      "Build responsive, accessible web interfaces",
      "Write clean, maintainable code with comprehensive tests",
      "Debug and optimize application performance",
      "Implement pixel-perfect designs from mockups",
      "Collaborate with cross-functional teams",
    ],
  },
  "Backend Developer": {
    template: "Design and develop scalable backend systems and APIs. Ensure data integrity, security, and optimal performance of server-side applications.",
    keyPoints: [
      "Design RESTful and GraphQL APIs",
      "Build robust database schemas and optimize queries",
      "Implement authentication and authorization systems",
      "Monitor and optimize application performance",
      "Write comprehensive tests and documentation",
    ],
  },
  "Senior Backend Developer": {
    template: "Architect and lead backend infrastructure development. Design scalable systems, mentor engineering teams, and establish technical standards.",
    keyPoints: [
      "Design microservices and distributed system architectures",
      "Lead technical design reviews and mentoring",
      "Optimize database performance at scale",
      "Implement CI/CD pipelines and deployment strategies",
      "Establish security and best practices standards",
    ],
  },
  "Full Stack Developer": {
    template: "Develop end-to-end features spanning frontend and backend. Take ownership of features from database to user interface.",
    keyPoints: [
      "Build full-featured applications from UI to database",
      "Design APIs and implement frontend integrations",
      "Handle database design and optimization",
      "Deploy and maintain applications",
      "Collaborate across teams on feature implementation",
    ],
  },
  "DevOps Engineer": {
    template: "Manage infrastructure, automate deployment pipelines, and ensure system reliability. Implement best practices for cloud infrastructure and monitoring.",
    keyPoints: [
      "Design and maintain cloud infrastructure (AWS/Azure/GCP)",
      "Automate deployment pipelines using CI/CD tools",
      "Implement monitoring, logging, and alerting systems",
      "Ensure system security and disaster recovery",
      "Optimize infrastructure costs and performance",
    ],
  },
  "QA Engineer": {
    template: "Ensure software quality through comprehensive testing strategies. Develop test automation frameworks and identify bugs before production.",
    keyPoints: [
      "Design and execute comprehensive test plans",
      "Develop automated test suites using modern frameworks",
      "Identify and document bugs with detailed reproduction steps",
      "Perform performance and load testing",
      "Collaborate with developers on quality standards",
    ],
  },
  "Data Scientist": {
    template: "Build machine learning models and data pipelines to drive business insights. Analyze complex datasets and develop predictive algorithms.",
    keyPoints: [
      "Develop and train machine learning models",
      "Analyze large datasets and derive insights",
      "Build data pipelines and ETL processes",
      "Optimize model performance and accuracy",
      "Communicate findings to non-technical stakeholders",
    ],
  },
  "Product Manager": {
    template: "Define product vision and strategy. Lead cross-functional teams to deliver products that meet user needs and business objectives.",
    keyPoints: [
      "Define product roadmap and feature priorities",
      "Conduct user research and competitive analysis",
      "Lead cross-functional product development",
      "Define KPIs and measure product success",
      "Communicate product vision to stakeholders",
    ],
  },
  "Solutions Architect": {
    template: "Design technical solutions that meet complex business requirements. Evaluate technologies and architect scalable, secure systems.",
    keyPoints: [
      "Design enterprise-scale technical solutions",
      "Evaluate and select appropriate technologies",
      "Create architecture documentation and diagrams",
      "Lead technical discussions with clients and teams",
      "Ensure solutions meet security and compliance requirements",
    ],
  },
};

function generateKeyPoints(jobTitle: string, userDescription?: string): string[] {
  // Find matching template
  const lowerTitle = jobTitle.toLowerCase();
  
  for (const [key, { keyPoints }] of Object.entries(JOB_DESCRIPTION_TEMPLATES)) {
    if (lowerTitle.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerTitle)) {
      return keyPoints;
    }
  }

  // If no exact match, return generic key points
  return [
    "Contribute to product development and innovation",
    "Collaborate with cross-functional teams",
    "Write clean, maintainable code",
    "Participate in code reviews",
    "Continuously learn and improve skills",
  ];
}

export function generateJobDescription(title: string, userDescription?: string): string {
  // Find matching template
  const lowerTitle = title.toLowerCase();
  let template: string | null = null;

  for (const [key, { template: tmpl }] of Object.entries(JOB_DESCRIPTION_TEMPLATES)) {
    if (lowerTitle.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerTitle)) {
      template = tmpl;
      break;
    }
  }

  // If user provided a description, enhance it
  if (userDescription && userDescription.trim().length > 0) {
    const keyPoints = generateKeyPoints(title, userDescription);
    return `${userDescription.trim()}\n\nKey Responsibilities:\n${keyPoints.map((p) => `• ${p}`).join("\n")}`;
  }

  // Generate from template
  if (template) {
    const keyPoints = generateKeyPoints(title);
    return `${template}\n\nKey Responsibilities:\n${keyPoints.map((p) => `• ${p}`).join("\n")}\n\nWe're looking for a talented professional to join our team!`;
  }

  // Fallback
  return `We are seeking a talented ${title} to join our team. In this role, you will be responsible for contributing to our product development and working collaboratively with cross-functional teams to deliver high-quality solutions.`;
}
