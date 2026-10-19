/**
 * Configurable personal developer data.
 * Adheres strictly to genuine profile details without inventing credentials or metrics.
 * Sourced directly from verified resume, GitHub repositories, and live projects.
 */

export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface ProjectEntry {
  id: string;
  title: string;
  tagline: string;
  category: "Web Application" | "AI / ML" | "Systems & Tools";
  techStack: string[];
  status: "Completed" | "In Development" | "Planned";
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
}

export interface EducationEntry {
  degreeOrCourse: string;
  institution: string;
  period: string;
  details?: string[];
}

export interface ExperienceEntry {
  role: string;
  organization: string;
  period: string;
  location?: string;
  employmentType?: string;
  description: string[];
  skills?: string[];
}

export interface CertificateEntry {
  /** Unique identifier for the certificate entry */
  id: string;
  /** Official title of the certification or course */
  title: string;
  /** Issuing organization or institution */
  issuer: string;
  /** Issue date or completion status when verified */
  issueDate?: string;
  /** Credential verification URL (e.g. NPTEL, Coursera, Google verification page) */
  verificationUrl?: string;
  /** Local image or PDF document path in /public/ when available */
  filePath?: string;
  /** Official credential or license identifier */
  credentialId?: string;
  /** Broad thematic category */
  category: "Programming & Computer Science" | "Data Structures & Algorithms" | "Artificial Intelligence & Tools" | "Systems & Tools" | "Cloud & DevOps";
  /** Core skills and competencies verified by this accreditation */
  skills: string[];
  /** Flag to highlight on primary showcase slots */
  featured?: boolean;
}

export const personalData = {
  identity: {
    fullName: "Manish Kumar Prajapat",
    preferredName: "Manish Kumar",
    headline: "Aspiring Full Stack Web Developer",
    location: "Jaipur, Rajasthan, India",
    phone: "7014162252",
    email: "manish2750797@gmail.com",
    shortBio:
      "Aspiring Full Stack Web Developer and Computer Science student at ICFAI University Jaipur with hands-on experience in building responsive and user-friendly web applications. Skilled in React.js, Next.js, Node.js, Express.js, MongoDB, HTML, CSS, and JavaScript. Passionate about developing real-world projects, learning new technologies, and building efficient, scalable web solutions.",
    focusAreas: [
      "Full Stack Web Development (React.js, Next.js, Node.js, Express.js)",
      "Modern Frontend & UI Design (Tailwind CSS, HTML5 Canvas, Responsive Web Design)",
      "Database Systems (MongoDB, MySQL, Cloudinary)",
      "Data Structures & Algorithms (350+ LeetCode problems solved)",
      "AI & Emerging Technologies (1M1B × AICTE Internship, AquaAlert AI)",
    ],
    languages: ["English", "Hindi"],
  },
  skills: [
    {
      title: "Programming Languages",
      skills: ["C", "C++", "Python", "JavaScript"],
    },
    {
      title: "Frameworks & Libraries",
      skills: ["React.js", "Next.js", "Node.js", "Express.js", "Tailwind CSS", "Bootstrap"],
    },
    {
      title: "Tools & Platforms",
      skills: ["Git", "GitHub", "VS Code", "Google Antigravity"],
    },
    {
      title: "Databases",
      skills: ["MongoDB", "MySQL", "Cloudinary"],
    },
    {
      title: "Soft Skills",
      skills: ["Problem Solving", "Quick Learning", "Teamwork", "Time Management", "Adaptability"],
    },
  ] as SkillCategory[],
  
  projects: [
    {
      id: "gpahub",
      title: "GPAHub – University CGPA & Percentage Calculator",
      tagline:
        "Developed a responsive CGPA and percentage calculator supporting multiple universities with university-specific grading formulas and 100% browser-based processing.",
      category: "Web Application",
      techStack: ["React", "JavaScript", "Tailwind CSS", "Vite"],
      status: "Completed",
      githubUrl: "https://github.com/Manishkumar4652/GPAHub",
      liveUrl: "https://gpahub-alpha.vercel.app",
      featured: true,
    },
    {
      id: "pitstop",
      title: "PitStop (RITZ) – Gig Worker Rest-Stop Discovery",
      tagline:
        "Gig worker rest-stop discovery and merchant services ecosystem connecting delivery riders with verified rest stops, hydration stations, and charging docks.",
      category: "Web Application",
      techStack: ["Next.js", "TypeScript", "Tailwind CSS", "MongoDB Atlas", "Express.js"],
      status: "Completed",
      githubUrl: "https://github.com/Manishkumar4652/Pitstop",
      liveUrl: "https://pitstop-olive.vercel.app",
      featured: true,
    },
    {
      id: "pixoptimize",
      title: "PixOptimize – Browser-Based Image Optimizer",
      tagline:
        "Zero-server client-side image compression and batch optimization tool supporting format conversion and target file size presets (50 KB to 1 MB).",
      category: "Web Application",
      techStack: ["TypeScript", "React", "Canvas API", "Tailwind CSS"],
      status: "Completed",
      githubUrl: "https://github.com/Manishkumar4652/Image_Compressor",
      liveUrl: "https://image-compressor-one-gules.vercel.app",
      featured: true,
    },
    {
      id: "meetx",
      title: "Meetx – Video Call & Real-Time Chat App",
      tagline:
        "Full-stack real-time video conferencing and collaborative messaging web application powered by WebRTC and WebSockets.",
      category: "Web Application",
      techStack: ["JavaScript", "WebRTC", "Socket.io", "Node.js", "Express.js"],
      status: "Completed",
      githubUrl: "https://github.com/Manishkumar4652/Meetx",
      featured: true,
    },
    {
      id: "aquaalert-ai",
      title: "AquaAlert AI – Water Scarcity Early Warning System",
      tagline:
        "Independently designed and developed a water scarcity early warning system focused on Rajasthan with interactive risk scoring and visualization using HTML5 Canvas.",
      category: "AI / ML",
      techStack: ["HTML5", "CSS3", "JavaScript", "HTML5 Canvas", "Responsive Web Design"],
      status: "Completed",
      githubUrl: "https://github.com/Manishkumar4652/AquaAlert-AI",
      liveUrl: "https://manishkumar4652.github.io/AquaAlert-AI/",
      featured: true,
    },
    {
      id: "wanderlust",
      title: "Wanderlust – Travel & Vacation Rentals Platform",
      tagline:
        "Full-stack Airbnb-inspired vacation rental platform featuring user authentication, property listings, Cloudinary photo uploads, and Mapbox geolocation.",
      category: "Web Application",
      techStack: ["Node.js", "Express.js", "MongoDB", "Cloudinary", "Bootstrap", "Mapbox"],
      status: "Completed",
      githubUrl: "https://github.com/Manishkumar4652/Wanderlust_Projects",
      featured: false,
    },
    {
      id: "zerodha-clone",
      title: "Zerodha Platform Clone – Trading Dashboard",
      tagline:
        "Full-stack trading dashboard and stock market monitoring interface replicating key Zerodha Kite workflows with watchlist and portfolio analytics.",
      category: "Web Application",
      techStack: ["React", "Node.js", "Express.js", "MongoDB", "Tailwind CSS"],
      status: "Completed",
      githubUrl: "https://github.com/Manishkumar4652/Zerodha_Project_clone",
      featured: false,
    },
    {
      id: "weather-forecast",
      title: "Weather Forecast – Real-Time Meteorological App",
      tagline:
        "Responsive real-time weather application connecting to external meteorological APIs to display temperature, humidity, and condition metrics.",
      category: "Web Application",
      techStack: ["HTML5", "CSS3", "JavaScript", "Weather API"],
      status: "Completed",
      githubUrl: "https://github.com/Manishkumar4652/Weather-Forcast",
      liveUrl: "https://manishkumar4652.github.io/Weather-Forecast/",
      featured: false,
    },
    {
      id: "fsoc-ai-tracking",
      title: "FSOC AI Camera Tracking (Smart India Hackathon)",
      tagline:
        "Computer vision-based camera tracking system designed for Free Space Optical Communications (FSOC) transceiver beam alignment.",
      category: "AI / ML",
      techStack: ["Python", "OpenCV", "Computer Vision", "AI/ML", "NumPy"],
      status: "Completed",
      githubUrl: "https://github.com/Manishkumar4652/SIH26169-FSOC-AI-Camera-Tracking",
      featured: false,
    },
    {
      id: "iot-security",
      title: "ESP8266 Ultrasonic Security System",
      tagline:
        "IoT-based movement detection and intrusion alert system utilizing NodeMCU ESP8266, HC-SR04 sensor, and instant Telegram Bot notifications.",
      category: "Systems & Tools",
      techStack: ["C++", "ESP8266 NodeMCU", "Arduino IDE", "Telegram Bot API", "IoT"],
      status: "Completed",
      githubUrl: "https://github.com/Manishkumar4652/My-IoT-Projects",
      featured: false,
    },
    {
      id: "mini-projects-css",
      title: "Interactive CSS & UI Components Lab",
      tagline:
        "Curated interactive showcase of modern CSS3 animations, glassmorphism layouts, 3D cards, and responsive UI components.",
      category: "Web Application",
      techStack: ["HTML5", "CSS3", "Responsive Design", "UI Design"],
      status: "Completed",
      githubUrl: "https://github.com/Manishkumar4652/Mini-Projects-CSS",
      liveUrl: "https://mini-projects-css-seven.vercel.app",
      featured: false,
    },
    {
      id: "dsa-all-codes",
      title: "Algorithmic Problem Solving & DSA Repository",
      tagline:
        "Extensive collection of 350+ Data Structures & Algorithms implementations and LeetCode problem solutions written in C++.",
      category: "Systems & Tools",
      techStack: ["C++", "Data Structures", "Algorithms", "Competitive Programming"],
      status: "Completed",
      githubUrl: "https://github.com/Manishkumar4652/DSA-All-CODES-",
      liveUrl: "https://leetcode.com/u/Manish_kumar4774",
      featured: false,
    },
  ] as ProjectEntry[],

  education: [
    {
      degreeOrCourse: "Bachelor of Technology (B.Tech) – Computer Science and Engineering",
      institution: "The ICFAI University, Jaipur",
      period: "2024 – 2028",
      details: [
        "CGPA: 8.0",
        "Pursuing degree with focus on software development, programming, and building practical technical skills.",
        "Expected graduation: 2028",
      ],
    },
    {
      degreeOrCourse: "Senior Secondary (Science – PCM)",
      institution: "Impulse School, Dausa",
      period: "2021 – 2023",
      details: [
        "Final Grade: 81%",
        "Rigorous coursework in Physics, Chemistry, and Mathematics.",
      ],
    },
  ] as EducationEntry[],

  experience: [
    {
      role: "AI & Emerging Technologies Intern",
      organization: "1M1B (One Million for One Billion) × AICTE",
      period: "May 2026 – Jul 2026",
      location: "Remote India",
      employmentType: "Internship",
      description: [
        "Completed an internship in AI & Emerging Technologies through the 1M1B × AICTE initiative, gaining hands-on experience in developing technology-based solutions.",
        "Independently designed and developed AquaAlert AI, a water scarcity early warning system focused on Rajasthan.",
        "Implemented interactive risk scoring and visualization features using HTML5, CSS3, and JavaScript to support water scarcity risk awareness.",
        "Applied technology to a real-world sustainability challenge, enhancing awareness of water scarcity and responsible water resource management.",
      ],
      skills: ["HTML5", "CSS3", "JavaScript", "HTML5 Canvas", "Responsive Web Design"],
    },
    {
      role: "Independent Web Developer",
      organization: "Personal Projects & Open-Source Software",
      period: "2024 – Present",
      description: [
        "Developed GPAHub (https://www.gpahub.me), a responsive CGPA and percentage calculator supporting multiple universities with 100% browser-based processing.",
        "Built PixOptimize (https://pixoptimize.com), a browser-based image optimization tool with batch optimization and target file-size presets ranging from 50 KB to 1 MB.",
        "Engineered Weather Forecast, a responsive real-time weather application integrating API data to display temperature, humidity, and weather conditions across devices.",
        "Solved 350+ algorithmic problems on LeetCode demonstrating proficiency in Data Structures and Algorithms.",
      ],
    },
  ] as ExperienceEntry[],

  certificates: [
  {
    "id": "cert_the_joy_of_computing_using_pyt_1",
    "title": "The Joy of Computing using Python — Elite Certification",
    "issuer": "NPTEL, IIT Madras (MoE)",
    "issueDate": "Jul–Oct 2025",
    "category": "Programming & Computer Science",
    "skills": [
      "Python",
      "Algorithms",
      "Data Processing",
      "Elite Silver Medal (86%)"
    ],
    "featured": true,
    "verificationUrl": "https://nptel.ac.in/noc",
    "credentialId": "NPTEL25CS103S1058603064",
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431245/portfolio/certificates/cert_01_The_Joy_of_Computing_using_Python.pdf"
  },
  {
    "id": "cert_codehelpdsa_pdf_2",
    "title": "Data Structures & Algorithms (DSA) — Supreme 4.0 Batch",
    "issuer": "CodeHelp | Mentor: Love Babbar",
    "issueDate": "June 2026",
    "category": "Data Structures & Algorithms",
    "skills": [
      "C++",
      "Data Structures",
      "Algorithms",
      "Dynamic Programming",
      "Graphs & Trees"
    ],
    "featured": true,
    "credentialId": "DC91TGJI",
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431247/portfolio/certificates/cert_02_CodehelpDSA.pdf"
  },
  {
    "id": "cert_untitled_design_pdf_3",
    "title": "Delta — Full Stack Web Development (MERN)",
    "issuer": "Apna College | Mentor: Shradha Khapra",
    "issueDate": "2025–2026",
    "category": "Programming & Computer Science",
    "skills": [
      "React.js",
      "Node.js",
      "Express.js",
      "MongoDB",
      "REST APIs",
      "Full Stack Development"
    ],
    "featured": true,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431250/portfolio/certificates/cert_03_Untitled_design.pdf"
  },
  {
    "id": "cert_internship_pdf_4",
    "title": "AI for Sustainability Virtual Internship",
    "issuer": "1M1B × AICTE (in collaboration with IBM SkillsBuild)",
    "issueDate": "May–July 2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "Agentic AI",
      "RAG Systems",
      "AquaAlert AI",
      "Sustainable Tech",
      "IBM SkillsBuild"
    ],
    "featured": true,
    "credentialId": "INTERNSHIP_177676133869e739fae888f",
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431252/portfolio/certificates/cert_04_Internship.pdf"
  },
  {
    "id": "cert_data_analytics_with_python_pdf_5",
    "title": "Data Analytics with Python",
    "issuer": "NPTEL (Swayam / MoE, Govt. of India)",
    "issueDate": "Jan–Apr 2026",
    "category": "Programming & Computer Science",
    "skills": [
      "Data Analytics",
      "Python",
      "NumPy & Pandas",
      "Statistical Modeling"
    ],
    "featured": true,
    "verificationUrl": "https://nptel.ac.in/noc",
    "credentialId": "NPTEL26CS86S656603834",
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431255/portfolio/certificates/cert_05_DATA_ANALYTICS_WITH_PYTHON.pdf"
  },
  {
    "id": "cert_aws_academy_graduate___machine_6",
    "title": "AWS Academy Graduate — Machine Learning Foundations",
    "issuer": "Amazon Web Services (AWS) Academy",
    "issueDate": "April 01, 2026",
    "category": "Cloud & DevOps",
    "skills": [
      "AWS Cloud",
      "Machine Learning",
      "SageMaker",
      "Cloud AI Infrastructure"
    ],
    "featured": true,
    "verificationUrl": "https://www.credly.com/go/gWSOVpO8",
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431257/portfolio/certificates/cert_06_AWS_Academy_Graduate___Machine_Lear.pdf"
  },
  {
    "id": "cert_googlepromptingessentials_badg_7",
    "title": "Google Prompting Essentials — Professional Certificate",
    "issuer": "Google (via Coursera & Credly)",
    "issueDate": "May 22, 2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "Prompt Engineering",
      "Generative AI",
      "Large Language Models",
      "AI Workflows"
    ],
    "featured": true,
    "verificationUrl": "https://www.credly.com/go/VgMs6XEV",
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431258/portfolio/certificates/cert_07_GooglePromptingEssentials_Badge2026.pdf"
  },
  {
    "id": "cert_googleaiessentialsv1_badge2026_8",
    "title": "Google AI Essentials",
    "issuer": "Google (via Coursera & Credly)",
    "issueDate": "May 24, 2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "Artificial Intelligence",
      "Productivity Engineering",
      "AI Ethics",
      "Google AI"
    ],
    "featured": true,
    "verificationUrl": "https://www.credly.com/go/Gq7gdlPU",
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431259/portfolio/certificates/cert_08_GoogleAIEssentialsV1_Badge20260524-.pdf"
  },
  {
    "id": "cert_aiskillspassport_badge20260328_9",
    "title": "AI Skills Passport",
    "issuer": "Microsoft Elevate & Ernst & Young (EY)",
    "issueDate": "March 19, 2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "Microsoft Elevate",
      "EY",
      "AI Literacy",
      "Business AI Applications"
    ],
    "featured": true,
    "verificationUrl": "https://www.credly.com/go/Dp6ReVKE",
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431263/portfolio/certificates/cert_09_AISkillsPassport_Badge20260328-31-7.pdf"
  },
  {
    "id": "cert_certificate_658a7e4d_dadd_4922_10",
    "title": "Unlocking AI for Everyone — National Skill Competency",
    "issuer": "Microsoft & NCVET (Govt. of India)",
    "issueDate": "April 02, 2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "Microsoft CSR",
      "NCVET Accredited",
      "AI Competency",
      "NSQF Level 2"
    ],
    "featured": true,
    "credentialId": "2026022190923177-161040",
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431264/portfolio/certificates/cert_10_certificate_658a7e4d-dadd-4922-8f22.pdf"
  },
  {
    "id": "cert_tata_certificate_pdf_11",
    "title": "Data Visualisation: Empowering Business with Effective Insights",
    "issuer": "Tata Group (via Forage)",
    "issueDate": "April 05, 2026",
    "category": "Programming & Computer Science",
    "skills": [
      "Data Visualisation",
      "Business Intelligence",
      "Executive Reporting",
      "Forage"
    ],
    "featured": true,
    "credentialId": "s42YcBEPE2gvqfBCA",
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431266/portfolio/certificates/cert_11_TATA_certificate.pdf"
  },
  {
    "id": "cert_aws_cloud_development_kit_pdf_12",
    "title": "AWS Cloud Development Kit (CDK) — Getting Started",
    "issuer": "Amazon Web Services (AWS)",
    "issueDate": "April 20, 2026",
    "category": "Cloud & DevOps",
    "skills": [
      "AWS CDK",
      "Infrastructure as Code",
      "Cloud Architecture",
      "AWS Cloud"
    ],
    "featured": true,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431267/portfolio/certificates/cert_12_AWS_Cloud_Development_Kit.pdf"
  },
  {
    "id": "cert_amazon_q_developer_pdf_13",
    "title": "Amazon Q Developer — Getting Started & Architecture",
    "issuer": "Amazon Web Services (AWS)",
    "issueDate": "June 07, 2026",
    "category": "Cloud & DevOps",
    "skills": [
      "Amazon Q",
      "Generative AI Developer Tools",
      "AWS Cloud",
      "Code Optimization"
    ],
    "featured": true,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431268/portfolio/certificates/cert_13_Amazon_Q_Developer.pdf"
  },
  {
    "id": "cert_green_skills___applied_al_for__14",
    "title": "Green Skills & Applied AI for Climate Action Bootcamp",
    "issuer": "1M1B Foundation, Microsoft Elevate & MeitY Startup Hub",
    "issueDate": "2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "Applied AI",
      "Climate Action",
      "Microsoft Elevate",
      "MeitY Startup Hub"
    ],
    "featured": true,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431269/portfolio/certificates/cert_14_Green_Skills___Applied_Al_for_Clima.pdf"
  },
  {
    "id": "cert_1c437b57_2369_4153_aa53_2a03fd_16",
    "title": "CSS3 — Modern Web Styling & Responsive Design",
    "issuer": "Infosys Springboard",
    "issueDate": "April 1, 2026",
    "category": "Programming & Computer Science",
    "skills": [
      "CSS3",
      "Responsive Design",
      "Flexbox & Grid",
      "Infosys Springboard"
    ],
    "featured": false,
    "verificationUrl": "https://verify.onwingspan.com",
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431284/portfolio/certificates/cert_16_1c437b57-2369-4153-aa53-2a03fdf6868.pdf"
  },
  {
    "id": "cert_3bbf3cea_68d0_4b91_9404_9de9b4_17",
    "title": "Angular Framework Essentials",
    "issuer": "Infosys Springboard",
    "issueDate": "March 27, 2026",
    "category": "Programming & Computer Science",
    "skills": [
      "Angular",
      "TypeScript",
      "Component Architecture",
      "Infosys Springboard"
    ],
    "featured": false,
    "verificationUrl": "https://verify.onwingspan.com",
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431285/portfolio/certificates/cert_17_3bbf3cea-68d0-4b91-9404-9de9b494c37.pdf"
  },
  {
    "id": "cert_5254785198mp_pdf_18",
    "title": "Google Workspace — Bring AI to Work Workshop",
    "issuer": "Google Workspace",
    "issueDate": "March 27, 2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "Google Workspace",
      "Gemini for Workspace",
      "AI Collaboration",
      "Productivity"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431287/portfolio/certificates/cert_18_5254785198MP.pdf"
  },
  {
    "id": "cert_9d1ce136_006b_43a8_8f3a_f26534_19",
    "title": "GopwnIt CTF — Cybersecurity Competition",
    "issuer": "GopwnIt & Unstop",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Capture The Flag (CTF)",
      "Cybersecurity",
      "Web Exploitation",
      "Cryptography"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431289/portfolio/certificates/cert_19_9d1ce136-006b-43a8-8f3a-f26534d630c.pdf"
  },
  {
    "id": "cert_aws_ai_training_pdf_20",
    "title": "Amazon Q Introduction — Generative AI Assistant",
    "issuer": "Amazon Web Services (AWS)",
    "issueDate": "April 04, 2026",
    "category": "Cloud & DevOps",
    "skills": [
      "Amazon Q",
      "Cloud AI",
      "Generative AI",
      "AWS"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431291/portfolio/certificates/cert_20_AWS_ai_training.pdf"
  },
  {
    "id": "cert_beyond_the_wrapper_pdf_21",
    "title": "AI Quest: Beyond the Wrapper",
    "issuer": "HiDevs & Unstop",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "AI Architecture",
      "LLM Engineering",
      "Applied Machine Learning"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431292/portfolio/certificates/cert_21_Beyond_the_Wrapper.pdf"
  },
  {
    "id": "cert_certificate_249802_34_ew592_pd_22",
    "title": "AI Skills Passport — Employability & Sustainability",
    "issuer": "Ernst & Young (EY) & Microsoft",
    "issueDate": "2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "AI Employability",
      "Sustainability Tech",
      "EY",
      "Microsoft"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431293/portfolio/certificates/cert_22_Certificate_249802_34_ew592.pdf"
  },
  {
    "id": "cert_completion_certificate___skill_23",
    "title": "AI & Emerging Technologies Coursework",
    "issuer": "IBM SkillsBuild & 1M1B",
    "issueDate": "12 May 2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "Emerging Technologies",
      "IBM SkillsBuild",
      "AI Applications"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431294/portfolio/certificates/cert_23_Completion_Certificate___SkillsBuil.pdf"
  },
  {
    "id": "cert_completion_certificate___skill_24",
    "title": "Use Generative AI for Software Development",
    "issuer": "IBM SkillsBuild & 1M1B",
    "issueDate": "15 May 2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "Generative AI",
      "Software Engineering",
      "Code Synthesis",
      "IBM SkillsBuild"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431297/portfolio/certificates/cert_24_Completion_Certificate___SkillsBuil.pdf"
  },
  {
    "id": "cert_completion_certificate_pdf_25",
    "title": "1M1B | AI for Sustainability",
    "issuer": "IBM SkillsBuild & 1M1B",
    "issueDate": "15 May 2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "AI for Sustainability",
      "Green Technology",
      "IBM SkillsBuild"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431304/portfolio/certificates/cert_25_Completion_Certificate.pdf"
  },
  {
    "id": "cert_coursera_design_prompts_for_ev_26",
    "title": "Design Prompts for Everyday Work Tasks",
    "issuer": "Google (via Coursera)",
    "issueDate": "2025–2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "Prompt Design",
      "Workplace Automation",
      "Google AI"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431309/portfolio/certificates/cert_26_Coursera_Design_Prompts_for_Everyda.pdf"
  },
  {
    "id": "cert_coursera_discover_the_art_of_p_27",
    "title": "Discover the Art of Prompting",
    "issuer": "Google (via Coursera)",
    "issueDate": "2025–2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "Prompt Engineering",
      "LLM Context Windows",
      "Few-Shot Learning"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431311/portfolio/certificates/cert_27_Coursera_Discover_the_Art_of_Prompt.pdf"
  },
  {
    "id": "cert_coursera_google_prompting_esse_28",
    "title": "Design Prompts for Everyday Work Tasks",
    "issuer": "Google (via Coursera)",
    "issueDate": "May 22, 2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "Prompt Design",
      "Workplace Automation",
      "Google AI"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431313/portfolio/certificates/cert_28_Coursera_Google_Prompting_Essential.pdf"
  },
  {
    "id": "cert_coursera_maximize_productivity_29",
    "title": "Maximize Productivity With AI Tools",
    "issuer": "Google (via Coursera)",
    "issueDate": "2025–2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "AI Productivity",
      "Workflow Automation",
      "Google AI Tools"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431314/portfolio/certificates/cert_29_Coursera_Maximize_Productivity_With.pdf"
  },
  {
    "id": "cert_coursera_speed_up_data_analysi_30",
    "title": "Speed Up Data Analysis and Presentation Building",
    "issuer": "Google (via Coursera)",
    "issueDate": "2025–2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "Data Analysis",
      "Automated Presentations",
      "Insight Synthesis"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431316/portfolio/certificates/cert_30_Coursera_Speed_Up_Data_Analysis_and.pdf"
  },
  {
    "id": "cert_coursera_start_writing_prompts_31",
    "title": "Start Writing Prompts like a Pro",
    "issuer": "Google (via Coursera)",
    "issueDate": "2025–2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "Prompt Crafting",
      "Clarity & Constraints",
      "Google AI"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431317/portfolio/certificates/cert_31_Coursera_Start_Writing_Prompts_like.pdf"
  },
  {
    "id": "cert_coursera_stay_ahead_of_the_ai__32",
    "title": "Stay Ahead of the AI Curve",
    "issuer": "Google (via Coursera)",
    "issueDate": "2025–2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "AI Trends",
      "Technological Adaptation",
      "Continuous Learning"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431318/portfolio/certificates/cert_32_Coursera_Stay_Ahead_of_the_AI_Curve.pdf"
  },
  {
    "id": "cert_coursera_use_ai_responsibly_pd_33",
    "title": "Use AI Responsibly",
    "issuer": "Google (via Coursera)",
    "issueDate": "2025–2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "AI Ethics",
      "Bias Mitigation",
      "Responsible AI",
      "Data Privacy"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431319/portfolio/certificates/cert_33_Coursera_Use_AI_Responsibly.pdf"
  },
  {
    "id": "cert_coursera_wvig4dpt6u74_pdf_34",
    "title": "Google Prompting Essentials — 4-Course Specialization",
    "issuer": "Google (via Coursera)",
    "issueDate": "May 22, 2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "Prompt Engineering",
      "AI Productivity",
      "Data Analysis",
      "Google AI"
    ],
    "featured": false,
    "verificationUrl": "https://coursera.org/verify/specialization/WVIG4DPT6U74",
    "credentialId": "WVIG4DPT6U74",
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431322/portfolio/certificates/cert_34_Coursera_WVIG4DPT6U74.pdf"
  },
  {
    "id": "cert_coursera_introduction_to_ai_pd_35",
    "title": "Introduction to AI",
    "issuer": "Google (via Coursera)",
    "issueDate": "2025–2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "Artificial Intelligence Fundamentals",
      "Machine Learning Basics",
      "Neural Networks"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431324/portfolio/certificates/cert_35_Coursera_introduction_to_ai.pdf"
  },
  {
    "id": "cert_genai_powered_data_analytics_j_36",
    "title": "GenAI Powered Data Analytics Job Simulation",
    "issuer": "Forage",
    "issueDate": "2025–2026",
    "category": "Programming & Computer Science",
    "skills": [
      "Generative AI",
      "Data Analytics",
      "Business Intelligence",
      "Forage"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431325/portfolio/certificates/cert_36_GenAI_Powered_Data_Analytics_Job_Si.pdf"
  },
  {
    "id": "cert_hammer_of_unstop_pdf_37",
    "title": "Hammer of Unstop — Skill Challenge",
    "issuer": "Unstop",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Rapid Problem Solving",
      "Logic Puzzles",
      "Unstop"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431329/portfolio/certificates/cert_37_Hammer_of_Unstop.pdf"
  },
  {
    "id": "cert_infosys_twitter_bootstrap_pdf_38",
    "title": "Twitter Bootstrap — Responsive UI Framework",
    "issuer": "Infosys Springboard",
    "issueDate": "May 22, 2026",
    "category": "Programming & Computer Science",
    "skills": [
      "Bootstrap",
      "UI Components",
      "Grid System",
      "Infosys Springboard"
    ],
    "featured": false,
    "verificationUrl": "https://verify.onwingspan.com",
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431335/portfolio/certificates/cert_38_Infosys_Twitter_Bootstrap.pdf"
  },
  {
    "id": "cert_introduction_to_web_developmen_39",
    "title": "Introduction to Web Development with ChatGPT",
    "issuer": "Edunet Foundation & AICTE",
    "issueDate": "June 08, 2026",
    "category": "Programming & Computer Science",
    "skills": [
      "AI-Assisted Web Development",
      "ChatGPT",
      "HTML/CSS/JS",
      "Edunet Foundation"
    ],
    "featured": false,
    "credentialId": "10324462",
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431337/portfolio/certificates/cert_39_Introduction_to_Web_Development_wit.pdf"
  },
  {
    "id": "cert_joyspoon_of_unstop_pdf_40",
    "title": "Joyspoon of Unstop — Challenge Series",
    "issuer": "Unstop",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Creative Thinking",
      "Speed Coding",
      "Unstop"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431339/portfolio/certificates/cert_40_Joyspoon_of_Unstop.pdf"
  },
  {
    "id": "cert_mavi_s_pantry_of_unstop_pdf_41",
    "title": "MAVI's Pantry of Unstop — Skill Challenge",
    "issuer": "Unstop",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Logic & Deduction",
      "Problem Solving",
      "Unstop"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431342/portfolio/certificates/cert_41_MAVI_s_Pantry_of_Unstop.pdf"
  },
  {
    "id": "cert_naukricampus_pdf_42",
    "title": "BrandQuezt: Product Marketing & Strategy",
    "issuer": "Naukri Campus",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Product Strategy",
      "Brand Management",
      "Market Positioning"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431344/portfolio/certificates/cert_42_NaukriCampus.pdf"
  },
  {
    "id": "cert_naukricampus_certifica__future_43",
    "title": "Techquest: Future-Proof Skills & Tech Careers",
    "issuer": "Naukri Campus",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Tech Careers",
      "Future Skills",
      "Industry Preparation"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431347/portfolio/certificates/cert_43_NaukriCampus_Certifica__Future-Proo.pdf"
  },
  {
    "id": "cert_naukricampus_certificate_achie_44",
    "title": "TechQuezt #33: Internet Technologies — Rank 2",
    "issuer": "Naukri Campus",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Internet Technologies",
      "Competitive Tech",
      "Rank 2 Secured",
      "Naukri Campus"
    ],
    "featured": true,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431350/portfolio/certificates/cert_44_NaukriCampus_Certificate_Achievemen.pdf"
  },
  {
    "id": "cert_naukricampus_certificate_achie_45",
    "title": "BizQuezt #34: Consulting & Strategy — Rank 3",
    "issuer": "Naukri Campus",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Business Strategy",
      "Consulting Analytics",
      "Rank 3 Secured",
      "Naukri Campus"
    ],
    "featured": true,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431352/portfolio/certificates/cert_45_NaukriCampus_Certificate_Achievemen.pdf"
  },
  {
    "id": "cert_naukricampus_certificate_parti_46",
    "title": "DataQuezt: Data Engineering & Analytics",
    "issuer": "Naukri Campus",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Data Analytics",
      "Data Queries",
      "Problem Solving"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431355/portfolio/certificates/cert_46_NaukriCampus_Certificate_Participat.pdf"
  },
  {
    "id": "cert_naukricampus_certificate_parti_47",
    "title": "GenQuezt: Generative AI & Automation",
    "issuer": "Naukri Campus",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Generative AI",
      "Prompt Systems",
      "AI Innovation"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431356/portfolio/certificates/cert_47_NaukriCampus_Certificate_Participat.pdf"
  },
  {
    "id": "cert_naukricampus_certificate_parti_48",
    "title": "Naukri Campus Technical Challenge",
    "issuer": "Naukri Campus",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Technical Challenge",
      "Problem Solving",
      "Naukri Campus"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431357/portfolio/certificates/cert_48_NaukriCampus_Certificate_Participat.pdf"
  },
  {
    "id": "cert_naukricampus_certificate_parti_49",
    "title": "DigiQuezt: Digital Transformation & Cloud",
    "issuer": "Naukri Campus",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Digital Transformation",
      "Cloud Services",
      "Web Systems"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431363/portfolio/certificates/cert_49_NaukriCampus_Certificate_Participat.pdf"
  },
  {
    "id": "cert_naukricampus_certificate_parti_50",
    "title": "Codequezt: Algorithmic Problem Solving",
    "issuer": "Naukri Campus",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Algorithms",
      "Logic & Coding",
      "Debugging"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431369/portfolio/certificates/cert_50_NaukriCampus_Certificate_Participat.pdf"
  },
  {
    "id": "cert_naukricampus_certificate_parti_51",
    "title": "DataQuezt: Data Engineering & Analytics",
    "issuer": "Naukri Campus",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Data Analytics",
      "Data Queries",
      "Problem Solving"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431370/portfolio/certificates/cert_51_NaukriCampus_Certificate_Participat.pdf"
  },
  {
    "id": "cert_naukricampus_certificate_parti_52",
    "title": "TechQuezt: India's Digital Stack (DPI)",
    "issuer": "Naukri Campus",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "India Stack",
      "UPI & Aadhaar Systems",
      "Public Digital Infrastructure"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431371/portfolio/certificates/cert_52_NaukriCampus_Certificate_Participat.pdf"
  },
  {
    "id": "cert_naukricampus_certificate_parti_53",
    "title": "Naukri Campus Technical Challenge",
    "issuer": "Naukri Campus",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Technical Challenge",
      "Problem Solving",
      "Naukri Campus"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431372/portfolio/certificates/cert_53_NaukriCampus_Certificate_Participat.pdf"
  },
  {
    "id": "cert_operations_job_simulation_pdf_54",
    "title": "Operations Job Simulation",
    "issuer": "Forage",
    "issueDate": "2025–2026",
    "category": "Programming & Computer Science",
    "skills": [
      "Operations Engineering",
      "Process Optimization",
      "Efficiency Analytics"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431390/portfolio/certificates/cert_54_Operations_Job_Simulation.pdf"
  },
  {
    "id": "cert_setup_amazon_q_developer_pdf_55",
    "title": "Introduction to Amazon Q Developer — Technical",
    "issuer": "Amazon Web Services (AWS)",
    "issueDate": "April 20, 2026",
    "category": "Cloud & DevOps",
    "skills": [
      "Amazon Q",
      "Generative AI",
      "Cloud Development",
      "AWS"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431392/portfolio/certificates/cert_55_Setup_Amazon_Q_Developer.pdf"
  },
  {
    "id": "cert_software_engineering_assessmen_56",
    "title": "National Software Engineering Assessment",
    "issuer": "MKSSS Cummins College of Engineering for Women (CCOEW), Pune",
    "issueDate": "2026",
    "category": "Programming & Computer Science",
    "skills": [
      "Software Engineering",
      "System Design",
      "Code Analysis"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431397/portfolio/certificates/cert_56_Software_Engineering_Assessment.pdf"
  },
  {
    "id": "cert_technology_software_developmen_57",
    "title": "Technology Software Development Job Simulation",
    "issuer": "Forage",
    "issueDate": "2025–2026",
    "category": "Programming & Computer Science",
    "skills": [
      "Software Engineering",
      "System Architecture",
      "Code Review",
      "Forage"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431403/portfolio/certificates/cert_57_Technology_Software_Development_Job.pdf"
  },
  {
    "id": "cert_unstop_aptitude___logic_olympi_58",
    "title": "Unstop Aptitude & Logic Olympiad",
    "issuer": "Unstop",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Analytical Aptitude",
      "Logical Reasoning",
      "Mathematical Logic"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431405/portfolio/certificates/cert_58_Unstop_Aptitude___Logic_Olympiad.pdf"
  },
  {
    "id": "cert_unstop_week_of_wins_pdf_59",
    "title": "Unstop Week-of-Wins Challenge Series",
    "issuer": "Unstop",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Continuous Learning",
      "Problem Solving",
      "Daily Challenges"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431406/portfolio/certificates/cert_59_Unstop_Week-of-Wins.pdf"
  },
  {
    "id": "cert_unstop_pitch_pdf_60",
    "title": "Unstop Pitch Competition",
    "issuer": "Unstop",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Pitch Presentation",
      "Product Innovation",
      "Startup Feasibility"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431407/portfolio/certificates/cert_60_Unstop_pitch.pdf"
  },
  {
    "id": "cert_unstop_pdf_61",
    "title": "Unstop Competitive Challenge",
    "issuer": "Unstop",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Skill Challenge",
      "Problem Solving",
      "Unstop"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431408/portfolio/certificates/cert_61_Unstop.pdf"
  },
  {
    "id": "cert_afa4e523_c3b1_4b7b_b05d_396519_62",
    "title": "HTML5 — The Core Web Language",
    "issuer": "Infosys Springboard",
    "issueDate": "March 27, 2026",
    "category": "Programming & Computer Science",
    "skills": [
      "HTML5",
      "Semantic HTML",
      "DOM Structure",
      "Infosys Springboard"
    ],
    "featured": false,
    "verificationUrl": "https://verify.onwingspan.com",
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431409/portfolio/certificates/cert_62_afa4e523-c3b1-4b7b-b05d-3965190d600.pdf"
  },
  {
    "id": "cert_aiquizecrew_pdf_63",
    "title": "QuizOff 2026: India's Biggest AI Quiz",
    "issuer": "CampusCrew & Unstop",
    "issueDate": "July 19, 2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "AI Quiz Competition",
      "Competitive Reasoning",
      "CampusCrew",
      "Unstop"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431436/portfolio/certificates/cert_63_aiquizecrew.pdf"
  },
  {
    "id": "cert_aws_amazon_q_pdf_64",
    "title": "Introduction to Amazon Q Developer — Technical",
    "issuer": "Amazon Web Services (AWS)",
    "issueDate": "April 05, 2026",
    "category": "Cloud & DevOps",
    "skills": [
      "Amazon Q",
      "Generative AI",
      "Cloud Development",
      "AWS"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431437/portfolio/certificates/cert_64_aws_amazon_q.pdf"
  },
  {
    "id": "cert_certificatesimplern_pdf_65",
    "title": "SkillQuest — Generative AI Literacy",
    "issuer": "Simplilearn SkillUp",
    "issueDate": "September 13, 2026",
    "category": "Artificial Intelligence & Tools",
    "skills": [
      "Generative AI",
      "AI Literacy",
      "Simplilearn SkillUp"
    ],
    "featured": false,
    "credentialId": "20550616",
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431443/portfolio/certificates/cert_65_certificatesimplern.pdf"
  },
  {
    "id": "cert_f7d96291_fbb2_4399_a541_37d2f2_66",
    "title": "f7d96291-fbb2-4399-a541-37d2f2c778ec",
    "issuer": "Technical Organization",
    "issueDate": "2025–2026",
    "category": "Systems & Tools",
    "skills": [
      "Computer Science",
      "Technical Skills"
    ],
    "featured": false,
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431445/portfolio/certificates/cert_66_f7d96291-fbb2-4399-a541-37d2f2c778e.pdf"
  },
  {
    "id": "cert_ncat_participation_may_2026_pd_67",
    "title": "AINCAT 2026 — India's Biggest Career Aptitude Test",
    "issuer": "Naukri Campus & DoSelect",
    "issueDate": "June 01, 2026",
    "category": "Systems & Tools",
    "skills": [
      "Career Aptitude",
      "Problem Solving",
      "Logical Reasoning",
      "Naukri Campus"
    ],
    "featured": false,
    "credentialId": "6a19aa3c542fee52d1241f92",
    "filePath": "https://res.cloudinary.com/wutcaoqe/image/upload/v1792431447/portfolio/certificates/cert_67_ncat_participation_may_2026.pdf"
  }
] as CertificateEntry[],
};
