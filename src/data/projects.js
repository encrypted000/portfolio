const projects = [
  {
    id: 1,
    icon: 'bx bx-bar-chart-alt-2',
    category: 'pipeline', 
    image: '/images/jobpulse.png',
    tags: ['Python', 'PostgreSQL', 'FastAPI', 'Streamlit', 'Pandas', 'Docker', 'REST API', 'Data Pipeline'],
    title: 'System Architecture – JobPulse Data Pipeline',
    desc: 'JobPulse is a job market analytics platform that collects UK job listings using APIs and transforms them into actionable insights. The pipeline uses Python, PostgreSQL, FastAPI, and Streamlit to automate data ingestion, processing, and visualization of job trends across the UK.',
    github: 'https://github.com/encrypted000/System-Architecture-JobPulse-Data-Pipeline.git',
  },
  
  {
    id: 2,
    icon: 'bx bx-trending-up',
    category: 'pipeline',
    image: '/images/datawarehouse.png',
    tags: ['Data Warehouse', 'Data Pipeline', 'Data Analysis','Medallion Architecture','Data Modeling', 'Dashboard'],
    title: 'Data Warehouse and Analytics',
    desc: 'This project demonstrates a comprehensive data warehousing and analytics solution, from building a data warehouse to generating actionable insights. Designed as a portfolio project, it highlights industry best practices in data engineering and analytics.',
    github: 'https://github.com/encrypted000/data-warehouse-project',
  },

  {
    id: 3,
    icon: 'bx bx-trending-up',
    category: 'analytics',
    image: '/images/TRS.png',
    tags: ['Data Analytics', 'Desktop App', 'SQLite', 'Dashboard', 'Inventory Management', 'Finance'],
    title: 'Real-Time Business Analytics Dashboard',
    desc: 'Profit Pilot is a single-file desktop application that gives a small business real-time visibility into its numbers without internet, without subscriptions, without complexity. Everything lives in one SQLite file on the user machine.',
    github: 'https://github.com/encrypted000/profit-pilot',
  },
]

export default projects
