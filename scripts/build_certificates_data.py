import os
import json
import re

# Load parsed snippets
with open('scratch_parsed_certs.json', 'r', encoding='utf-8') as f:
    parsed = json.load(f)

# Load tier 1
with open('scratch_tier1.json', 'r', encoding='utf-8') as f:
    tier1 = json.load(f)

for c in tier1:
    if 'id' not in c or not c['id']:
        c['id'] = 'cert_' + re.sub(r'[^a-zA-Z0-9]', '_', c['filename'].lower()).strip('_')[:30] + '_' + str(c['displayOrder'])

tier1_files = {item['filename']: item for item in tier1}

all_certs = list(tier1)
current_order = 16

processed_files = set(tier1_files.keys())
excluded_files = {
    'MyXvBcppsW2FkNYCX_ifobHAoMjQs9s6bKS_69f2e25e0a7d5aa64b8a4677_1778864268721_completion_certificate.pdf',
    'Manish_Kumar_Prajapat.pdf',
    'Edusat Registrations.pdf',
    'README.txt'
}

for item in parsed:
    fn = item['filename']
    if fn in processed_files or fn in excluded_files:
        continue
    
    txt = item['text_snippet']
    cert = {
        'filename': fn,
        'featured': False,
        'displayOrder': current_order,
    }
    
    # 1. AWS Training & Certification
    if 'AWS Training & Certification' in txt or fn.startswith('AWS') or fn.startswith('Amazon Q') or fn.startswith('aws amazon q') or fn.startswith('Setup Amazon'):
        cert['issuer'] = 'Amazon Web Services (AWS)'
        cert['category'] = 'Cloud & DevOps'
        if 'Amazon Q Developer' in fn or 'Amazon Q Developer' in txt:
            cert['title'] = 'Introduction to Amazon Q Developer — Technical'
            cert['skills'] = ['Amazon Q', 'Generative AI', 'Cloud Development', 'AWS']
            cert['description'] = 'Technical walkthrough on utilizing Amazon Q Developer for building and debugging applications on AWS.'
        elif 'Amazon Q Introduction' in txt or 'AWS ai training' in fn:
            cert['title'] = 'Amazon Q Introduction — Generative AI Assistant'
            cert['skills'] = ['Amazon Q', 'Cloud AI', 'Generative AI', 'AWS']
            cert['description'] = 'Foundational training in AWS Amazon Q assistant capabilities and integration into enterprise workflows.'
        elif 'Setup Amazon Q' in fn or 'Setup Amazon Q' in txt:
            cert['title'] = 'Setup Amazon Q Developer in IDE & Command Line'
            cert['skills'] = ['IDE Integration', 'Amazon Q', 'Developer Tools', 'AWS']
            cert['description'] = 'Hands-on training in installing, authenticating, and customizing Amazon Q Developer across development environments.'
        else:
            cert['title'] = 'AWS Cloud & AI Developer Foundations'
            cert['skills'] = ['AWS Cloud', 'Cloud Computing', 'Developer Tools']
            cert['description'] = 'Accredited AWS training on core cloud tools, architectural patterns, and development environments.'
        
        m_date = re.search(r'Completed:\s*([A-Za-z]+ \d{1,2}, \d{4})', txt)
        if m_date:
            cert['issueDate'] = m_date.group(1)

    # 2. Coursera Google Prompting & AI Courses
    elif 'Coursera' in fn or ('Google' in txt and 'Coursera' in txt):
        cert['issuer'] = 'Google (via Coursera)'
        cert['category'] = 'Artificial Intelligence & Tools'
        if 'WVIG4DPT6U74' in fn:
            cert['title'] = 'Google Prompting Essentials — 4-Course Specialization'
            cert['skills'] = ['Prompt Engineering', 'AI Productivity', 'Data Analysis', 'Google AI']
            cert['credentialId'] = 'WVIG4DPT6U74'
            cert['verificationUrl'] = 'https://coursera.org/verify/specialization/WVIG4DPT6U74'
            cert['description'] = 'Completed the complete multi-course professional specialization authorized by Google on enterprise prompt engineering and generative workflows.'
        elif 'Design Prompts' in fn or 'Design Prompts' in txt:
            cert['title'] = 'Design Prompts for Everyday Work Tasks'
            cert['skills'] = ['Prompt Design', 'Workplace Automation', 'Google AI']
            cert['description'] = 'Google course on structuring task-specific prompt templates to automate common business and operational workflows.'
        elif 'Discover the Art of Prompting' in fn or 'Discover the Art of Prompting' in txt:
            cert['title'] = 'Discover the Art of Prompting'
            cert['skills'] = ['Prompt Engineering', 'LLM Context Windows', 'Few-Shot Learning']
            cert['description'] = 'Google course on advanced prompting strategies including persona adoption, context framing, and few-shot inference.'
        elif 'Maximize Productivity With AI Tools' in fn or 'Maximize Productivity' in txt:
            cert['title'] = 'Maximize Productivity With AI Tools'
            cert['skills'] = ['AI Productivity', 'Workflow Automation', 'Google AI Tools']
            cert['description'] = 'Google course exploring practical methods to multiply productivity in research, writing, and task execution using generative AI.'
        elif 'Speed Up Data Analysis' in fn or 'Speed Up Data Analysis' in txt:
            cert['title'] = 'Speed Up Data Analysis and Presentation Building'
            cert['skills'] = ['Data Analysis', 'Automated Presentations', 'Insight Synthesis']
            cert['description'] = 'Google course on leveraging generative AI tools to rapidly analyze raw datasets and synthesize presentation narratives.'
        elif 'Start Writing Prompts like a Pro' in fn or 'Start Writing Prompts' in txt:
            cert['title'] = 'Start Writing Prompts like a Pro'
            cert['skills'] = ['Prompt Crafting', 'Clarity & Constraints', 'Google AI']
            cert['description'] = 'Google course detailing precise syntax, temperature constraints, and formatting techniques for generative AI models.'
        elif 'Stay Ahead of the AI Curve' in fn or 'Stay Ahead' in txt:
            cert['title'] = 'Stay Ahead of the AI Curve'
            cert['skills'] = ['AI Trends', 'Technological Adaptation', 'Continuous Learning']
            cert['description'] = 'Google course evaluating rapid developments in artificial intelligence and strategies for lifelong technology adaptation.'
        elif 'Use AI Responsibly' in fn or 'Use AI Responsibly' in txt:
            cert['title'] = 'Use AI Responsibly'
            cert['skills'] = ['AI Ethics', 'Bias Mitigation', 'Responsible AI', 'Data Privacy']
            cert['description'] = 'Google course detailing ethical AI governance, safety guardrails, intellectual property considerations, and algorithmic fairness.'
        elif 'introduction to ai' in fn.lower():
            cert['title'] = 'Introduction to AI'
            cert['skills'] = ['Artificial Intelligence Fundamentals', 'Machine Learning Basics', 'Neural Networks']
            cert['description'] = 'Google course introducing core concepts of machine learning, deep learning, and practical AI applications.'
        elif 'Prompting Essentials' in fn:
            cert['title'] = 'Google Prompting Essentials'
            cert['skills'] = ['Prompt Engineering', 'Generative AI', 'Google AI']
            cert['description'] = 'Google authorized foundational certification covering high-impact prompt engineering workflows.'
        else:
            cert['title'] = 'Google AI Technical Course'
            cert['skills'] = ['AI Tools', 'Prompt Engineering', 'Google AI']
            cert['description'] = 'Google authorized course via Coursera covering practical artificial intelligence concepts.'

        m_date = re.search(r'([A-Za-z]+ \d{1,2}, \d{4})', txt)
        if m_date:
            cert['issueDate'] = m_date.group(1)

    # 3. Forage Virtual Job Simulations
    elif 'Job Simulation' in fn or 'Operations Job' in fn or 'Technology Software' in fn:
        cert['issuer'] = 'Forage'
        cert['category'] = 'Programming & Computer Science'
        if 'GenAI Powered' in fn:
            cert['title'] = 'GenAI Powered Data Analytics Job Simulation'
            cert['skills'] = ['Generative AI', 'Data Analytics', 'Business Intelligence', 'Forage']
            cert['description'] = 'Hands-on virtual simulation performing predictive analysis and automated reporting using modern Generative AI analytical models.'
        elif 'Technology Software' in fn:
            cert['title'] = 'Technology Software Development Job Simulation'
            cert['skills'] = ['Software Engineering', 'System Architecture', 'Code Review', 'Forage']
            cert['description'] = 'Completed practical simulation tasks in software architecture design, feature implementation, testing, and pull request reviews.'
        elif 'Operations Job' in fn:
            cert['title'] = 'Operations Job Simulation'
            cert['skills'] = ['Operations Engineering', 'Process Optimization', 'Efficiency Analytics']
            cert['description'] = 'Virtual work simulation focused on operational workflows, process automation, and organizational systems optimization.'
        else:
            cert['title'] = 'Virtual Software Engineering Simulation'
            cert['skills'] = ['Software Engineering', 'Industry Simulation', 'Forage']
            cert['description'] = 'Professional virtual work experience simulation solving real-world corporate engineering problems.'

        m_date = re.search(r'([A-Za-z]+ \d{1,2}(?:st|nd|rd|th)?, \d{4})', txt)
        if m_date:
            cert['issueDate'] = m_date.group(1)

    # 4. IBM SkillsBuild & 1M1B
    elif 'SkillsBuild' in fn or 'Completion Certificate' in fn:
        cert['issuer'] = 'IBM SkillsBuild & 1M1B'
        cert['category'] = 'Artificial Intelligence & Tools'
        if 'Generative AI for Software' in txt or 'SkillsBuild3' in fn:
            cert['title'] = 'Use Generative AI for Software Development'
            cert['skills'] = ['Generative AI', 'Software Engineering', 'Code Synthesis', 'IBM SkillsBuild']
            cert['description'] = 'IBM SkillsBuild course on integrating generative AI coding companions to accelerate development lifecycles and refactor code.'
        elif 'AI for Sustainability' in txt:
            cert['title'] = '1M1B | AI for Sustainability'
            cert['skills'] = ['AI for Sustainability', 'Green Technology', 'IBM SkillsBuild']
            cert['description'] = 'Foundational curriculum on applying artificial intelligence toward UN Sustainable Development Goals.'
        else:
            cert['title'] = 'AI & Emerging Technologies Coursework'
            cert['skills'] = ['Emerging Technologies', 'IBM SkillsBuild', 'AI Applications']
            cert['description'] = 'Verified learning plan completed through IBM SkillsBuild on modern emerging technologies.'

        m_date = re.search(r'Completion date:?\s*(\d{1,2} [A-Za-z]+ \d{4})', txt)
        if m_date:
            cert['issueDate'] = m_date.group(1)

    # 5. Infosys Springboard
    elif 'onwingspan.com' in txt or 'Infosys' in fn or fn.startswith('1c437b') or fn.startswith('3bbf3c') or fn.startswith('afa4e5'):
        cert['issuer'] = 'Infosys Springboard'
        cert['category'] = 'Programming & Computer Science'
        if 'CSS3' in txt or '1c437b' in fn:
            cert['title'] = 'CSS3 — Modern Web Styling & Responsive Design'
            cert['skills'] = ['CSS3', 'Responsive Design', 'Flexbox & Grid', 'Infosys Springboard']
            cert['description'] = 'Comprehensive training in modern CSS3 architecture, responsive viewport layouts, animations, and typography.'
        elif 'Angular' in txt or '3bbf3c' in fn:
            cert['title'] = 'Angular Framework Essentials'
            cert['skills'] = ['Angular', 'TypeScript', 'Component Architecture', 'Infosys Springboard']
            cert['description'] = 'Coursework on Angular framework fundamentals, TypeScript components, data binding, and dependency injection.'
        elif 'HTML5' in txt or 'afa4e5' in fn:
            cert['title'] = 'HTML5 — The Core Web Language'
            cert['skills'] = ['HTML5', 'Semantic HTML', 'DOM Structure', 'Infosys Springboard']
            cert['description'] = 'Deep-dive into semantic HTML5 markup, accessibility standards, web forms, and multimedia integration.'
        elif 'Bootstrap' in fn or 'Twitter Bootstrap' in txt:
            cert['title'] = 'Twitter Bootstrap — Responsive UI Framework'
            cert['skills'] = ['Bootstrap', 'UI Components', 'Grid System', 'Infosys Springboard']
            cert['description'] = 'Hands-on mastery of Bootstrap component library, grid utilities, and mobile-first responsive web development.'
        else:
            cert['title'] = 'Modern Web Development Course'
            cert['skills'] = ['Frontend Development', 'Web Standards', 'Infosys Springboard']
            cert['description'] = 'Verified coursework completed via Infosys Springboard digital learning platform.'

        cert['verificationUrl'] = 'https://verify.onwingspan.com'
        m_date = re.search(r'completing the course on ([A-Za-z]+ \d{1,2}, \d{4})', txt)
        if m_date:
            cert['issueDate'] = m_date.group(1)

    # 6. Google Workspace Bring AI to Work
    elif fn.startswith('5254785198MP'):
        cert['title'] = 'Google Workspace — Bring AI to Work Workshop'
        cert['issuer'] = 'Google Workspace'
        cert['issueDate'] = 'March 27, 2026'
        cert['category'] = 'Artificial Intelligence & Tools'
        cert['skills'] = ['Google Workspace', 'Gemini for Workspace', 'AI Collaboration', 'Productivity']
        cert['description'] = 'Official Google Workspace workshop on implementing Gemini and generative AI tools across business collaboration suites.'

    # 7. Simplilearn SkillUp
    elif 'simplern' in fn.lower():
        cert['title'] = 'SkillQuest — Generative AI Literacy'
        cert['issuer'] = 'Simplilearn SkillUp'
        cert['issueDate'] = 'September 13, 2026'
        cert['category'] = 'Artificial Intelligence & Tools'
        cert['skills'] = ['Generative AI', 'AI Literacy', 'Simplilearn SkillUp']
        cert['credentialId'] = '20550616'
        cert['description'] = 'Industry accredited program covering generative AI architectures, prompt optimization, and workplace automation.'

    # 8. Web Development with ChatGPT / AICTE
    elif 'ChatGPT' in fn:
        cert['title'] = 'Introduction to Web Development with ChatGPT'
        cert['issuer'] = 'Edunet Foundation & AICTE'
        cert['issueDate'] = 'June 08, 2026'
        cert['category'] = 'Programming & Computer Science'
        cert['skills'] = ['AI-Assisted Web Development', 'ChatGPT', 'HTML/CSS/JS', 'Edunet Foundation']
        cert['credentialId'] = '10324462'
        cert['description'] = 'Specialized workshop on pairing generative AI tools with frontend engineering workflows to accelerate web prototyping.'

    # 9. CampusCrew & Unstop QuizOff 2026
    elif 'aiquize' in fn:
        cert['title'] = "QuizOff 2026: India's Biggest AI Quiz"
        cert['issuer'] = 'CampusCrew & Unstop'
        cert['issueDate'] = 'July 19, 2026'
        cert['category'] = 'Artificial Intelligence & Tools'
        cert['skills'] = ['AI Quiz Competition', 'Competitive Reasoning', 'CampusCrew', 'Unstop']
        cert['description'] = "Recognized for competing in QuizOff 2026 among 5,25,000+ students from 48,500+ institutions across 35+ countries."

    # 10. NCAT 2026
    elif 'ncat' in fn.lower():
        cert['title'] = "AINCAT 2026 — India's Biggest Career Aptitude Test"
        cert['issuer'] = 'Naukri Campus & DoSelect'
        cert['issueDate'] = 'June 01, 2026'
        cert['category'] = 'Systems & Tools'
        cert['skills'] = ['Career Aptitude', 'Problem Solving', 'Logical Reasoning', 'Naukri Campus']
        cert['credentialId'] = '6a19aa3c542fee52d1241f92'
        cert['description'] = "National level assessment evaluating logical reasoning, quantitative analysis, algorithmic aptitude, and problem-solving skills."

    # 11. CCOEW Software Engineering Assessment
    elif 'Software Engineering Assessment' in fn:
        cert['title'] = 'National Software Engineering Assessment'
        cert['issuer'] = 'MKSSS Cummins College of Engineering for Women (CCOEW), Pune'
        cert['issueDate'] = '2026'
        cert['category'] = 'Programming & Computer Science'
        cert['skills'] = ['Software Engineering', 'System Design', 'Code Analysis']
        cert['description'] = 'Rigorous national assessment testing core software engineering fundamentals, design principles, and code quality.'

    # 12. EY & Microsoft AI Skills Passport
    elif 'Certificate_249802' in fn:
        cert['title'] = 'AI Skills Passport — Employability & Sustainability'
        cert['issuer'] = 'Ernst & Young (EY) & Microsoft'
        cert['issueDate'] = '2026'
        cert['category'] = 'Artificial Intelligence & Tools'
        cert['skills'] = ['AI Employability', 'Sustainability Tech', 'EY', 'Microsoft']
        cert['description'] = 'Completed specialized employability and sustainability tracks covering AI-driven business modernization.'

    # 13. Naukri Campus Challenges & Achievements
    elif 'NaukriCampus' in fn:
        cert['issuer'] = 'Naukri Campus'
        cert['category'] = 'Systems & Tools'
        if 'Achievement.pdf' in fn or '2nd rank' in txt:
            cert['title'] = 'TechQuezt #33: Internet Technologies — Rank 2'
            cert['skills'] = ['Internet Technologies', 'Competitive Tech', 'Rank 2 Secured', 'Naukri Campus']
            cert['featured'] = True
            cert['description'] = 'Secured 2nd Rank nationally in TechQuezt #33 testing deep comprehension of internet protocols and web architectures.'
        elif 'Achievement11.pdf' in fn or '3rd rank' in txt:
            cert['title'] = 'BizQuezt #34: Consulting & Strategy — Rank 3'
            cert['skills'] = ['Business Strategy', 'Consulting Analytics', 'Rank 3 Secured', 'Naukri Campus']
            cert['featured'] = True
            cert['description'] = 'Secured 3rd Rank nationally in BizQuezt #34 evaluating analytical case problem solving and consulting strategy.'
        elif 'Future-Proof Skills' in fn:
            cert['title'] = 'Techquest: Future-Proof Skills & Tech Careers'
            cert['skills'] = ['Tech Careers', 'Future Skills', 'Industry Preparation']
            cert['description'] = 'Challenge testing awareness of modern engineering roles, emerging tech stacks, and career adaptability.'
        elif "India's Digital Stack" in fn:
            cert['title'] = "TechQuezt: India's Digital Stack (DPI)"
            cert['skills'] = ['India Stack', 'UPI & Aadhaar Systems', 'Public Digital Infrastructure']
            cert['description'] = "Assessment of India's Digital Public Infrastructure (DPI) architecture, UPI, DigiLocker, and API ecosystems."
        elif 'DataQuezt' in txt or 'DataQuezt' in fn:
            cert['title'] = 'DataQuezt: Data Engineering & Analytics'
            cert['skills'] = ['Data Analytics', 'Data Queries', 'Problem Solving']
            cert['description'] = 'Competitive analytical challenge evaluating SQL, data modeling, and statistical inference.'
        elif 'GenQuezt' in txt or 'GenQuezt' in fn:
            cert['title'] = 'GenQuezt: Generative AI & Automation'
            cert['skills'] = ['Generative AI', 'Prompt Systems', 'AI Innovation']
            cert['description'] = 'National quiz evaluating modern LLM paradigms, prompt designs, and AI application architectures.'
        elif 'Codequezt' in txt or 'Codequezt' in fn:
            cert['title'] = 'Codequezt: Algorithmic Problem Solving'
            cert['skills'] = ['Algorithms', 'Logic & Coding', 'Debugging']
            cert['description'] = 'Competitive programming challenge testing speed, accuracy, and algorithmic efficiency.'
        elif 'DigiQuezt' in txt or 'DigiQuezt' in fn:
            cert['title'] = 'DigiQuezt: Digital Transformation & Cloud'
            cert['skills'] = ['Digital Transformation', 'Cloud Services', 'Web Systems']
            cert['description'] = 'Challenge evaluating understanding of cloud workflows and corporate digital modernization.'
        elif 'BrandQuezt' in txt or 'BrandQuezt' in fn:
            cert['title'] = 'BrandQuezt: Product Marketing & Strategy'
            cert['skills'] = ['Product Strategy', 'Brand Management', 'Market Positioning']
            cert['description'] = 'Strategic evaluation of brand storytelling, consumer positioning, and product marketing.'
        else:
            cert['title'] = 'Naukri Campus Technical Challenge'
            cert['skills'] = ['Technical Challenge', 'Problem Solving', 'Naukri Campus']
            cert['description'] = 'National level student competition evaluating aptitude, logic, and technological competence.'

    # 14. Unstop Competitions & Hackathons
    elif 'Unstop' in fn or 'gopwnit' in txt.lower() or 'HiDevs' in txt:
        cert['issuer'] = 'Unstop'
        cert['category'] = 'Systems & Tools'
        if 'GopwnIt' in txt or fn.startswith('9d1ce1'):
            cert['title'] = 'GopwnIt CTF — Cybersecurity Competition'
            cert['issuer'] = 'GopwnIt & Unstop'
            cert['skills'] = ['Capture The Flag (CTF)', 'Cybersecurity', 'Web Exploitation', 'Cryptography']
            cert['description'] = 'Participated in the university-level GopwnIt CTF competition tackling web vulnerability analysis, cryptography, and network forensics.'
        elif 'Beyond the Wrapper' in fn or 'Beyond the Wrapper' in txt:
            cert['title'] = 'AI Quest: Beyond the Wrapper'
            cert['issuer'] = 'HiDevs & Unstop'
            cert['skills'] = ['AI Architecture', 'LLM Engineering', 'Applied Machine Learning']
            cert['description'] = 'National AI competition challenging participants to architect bespoke AI systems beyond simple third-party wrapper APIs.'
        elif 'Aptitude & Logic' in fn:
            cert['title'] = 'Unstop Aptitude & Logic Olympiad'
            cert['skills'] = ['Analytical Aptitude', 'Logical Reasoning', 'Mathematical Logic']
            cert['description'] = 'National olympiad assessing quantitative aptitude, deductive reasoning, and pattern recognition.'
        elif 'pitch' in fn.lower():
            cert['title'] = 'Unstop Pitch Competition'
            cert['skills'] = ['Pitch Presentation', 'Product Innovation', 'Startup Feasibility']
            cert['description'] = 'Competitive product pitching event presenting technical feasibility and business value of innovative software solutions.'
        elif 'Week-of-Wins' in fn:
            cert['title'] = 'Unstop Week-of-Wins Challenge Series'
            cert['skills'] = ['Continuous Learning', 'Problem Solving', 'Daily Challenges']
            cert['description'] = 'Week-long coding and aptitude hackathon completing daily progressive algorithmic and system design sprints.'
        elif 'Hammer of Unstop' in fn:
            cert['title'] = 'Hammer of Unstop — Skill Challenge'
            cert['skills'] = ['Rapid Problem Solving', 'Logic Puzzles', 'Unstop']
            cert['description'] = 'Participated in the multi-day competitive skill challenge series hosted on Unstop platform.'
        elif 'Joyspoon' in fn:
            cert['title'] = 'Joyspoon of Unstop — Challenge Series'
            cert['skills'] = ['Creative Thinking', 'Speed Coding', 'Unstop']
            cert['description'] = 'Competitive milestone event in the Unstop national challenge marathon.'
        elif "MAVI's Pantry" in fn:
            cert['title'] = "MAVI's Pantry of Unstop — Skill Challenge"
            cert['skills'] = ['Logic & Deduction', 'Problem Solving', 'Unstop']
            cert['description'] = 'Milestone challenge sprint on the Unstop university competition ecosystem.'
        else:
            cert['title'] = 'Unstop Competitive Challenge'
            cert['skills'] = ['Skill Challenge', 'Problem Solving', 'Unstop']
            cert['description'] = 'Demonstrated active participation and performance in university-level challenges on Unstop.'

    else:
        cert['title'] = fn.replace('.pdf', '').replace('_', ' ')
        cert['issuer'] = 'Technical Organization'
        cert['category'] = 'Systems & Tools'
        cert['skills'] = ['Computer Science', 'Technical Skills']
        cert['description'] = 'Verified technical achievement and participation.'

    if 'issueDate' not in cert or not cert['issueDate']:
        cert['issueDate'] = '2025–2026'

    cert['id'] = 'cert_' + re.sub(r'[^a-zA-Z0-9]', '_', fn.lower()).strip('_')[:30] + '_' + str(current_order)
    all_certs.append(cert)
    current_order += 1

print(f'Total structured certificates: {len(all_certs)}')
with open('all_certificates_ready.json', 'w', encoding='utf-8') as f:
    json.dump(all_certs, f, indent=2)
print('Successfully saved all_certificates_ready.json')
