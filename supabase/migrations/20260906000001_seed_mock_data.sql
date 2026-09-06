-- Seed Mock Companies and Jobs
-- This migration populates the database with initial test data

-- ==========================================
-- SEED COMPANIES
-- ==========================================
INSERT INTO companies (id, name, slug, description, logo_url, website, industry, size, locations)
VALUES
  (
    'c1a1e1f0-0000-0000-0000-000000000001',
    'Acme Construction',
    'acme-construction',
    'Leading commercial construction firm specializing in infrastructure and building projects across the Midwest.',
    '',
    'https://acmeconstruction.example',
    'Construction',
    '1,000-5,000',
    ARRAY['Madison, WI', 'Chicago, IL', 'Minneapolis, MN']
  ),
  (
    'c1a1e1f0-0000-0000-0000-000000000002',
    'Globalcom Technologies',
    'globalcom-tech',
    'Telecommunications infrastructure company providing wireless network solutions nationwide.',
    '',
    'https://globalcom.example',
    'Telecommunications',
    '500-1,000',
    ARRAY['Remote', 'Milwaukee, WI', 'Madison, WI']
  ),
  (
    'c1a1e1f0-0000-0000-0000-000000000003',
    'Summit Engineering',
    'summit-engineering',
    'Civil engineering and project management firm focused on sustainable infrastructure.',
    '',
    'https://summiteng.example',
    'Engineering',
    '200-500',
    ARRAY['Madison, WI', 'Green Bay, WI']
  ),
  (
    'c1a1e1f0-0000-0000-0000-000000000004',
    'BuildRight Solutions',
    'buildright',
    'Residential and commercial construction company with emphasis on quality craftsmanship.',
    '',
    'https://buildright.example',
    'Construction',
    '100-200',
    ARRAY['Appleton, WI', 'Oshkosh, WI']
  );

-- ==========================================
-- SEED JOBS
-- ==========================================
INSERT INTO jobs (
  id,
  company_id,
  title,
  description,
  requirements,
  responsibilities,
  benefits,
  location,
  work_arrangement,
  employment_type,
  experience_level,
  salary_min,
  salary_max,
  salary_period,
  salary_is_estimated,
  posted_date
)
VALUES
  (
    'j0b1d000-0000-0000-0000-000000000001',
    'c1a1e1f0-0000-0000-0000-000000000001',
    'Project Engineer',
    'Seeking an experienced Project Engineer to lead field operations and coordinate construction projects. Ideal candidate has strong leadership background in telecommunications or construction.',
    ARRAY[
      '3+ years field construction experience',
      'Strong leadership and crew management',
      'Safety certification (OSHA 30)',
      'Project documentation experience',
      'Valid driver''s license'
    ],
    ARRAY[
      'Manage day-to-day field operations',
      'Coordinate with project managers and contractors',
      'Ensure safety compliance',
      'Maintain project documentation',
      'Supervise field crews'
    ],
    ARRAY[
      'Health, dental, vision insurance',
      '401(k) with 5% match',
      'Paid time off and holidays',
      'Professional development budget',
      'Company vehicle'
    ],
    'Madison, WI',
    'hybrid',
    'full_time',
    'mid',
    72000,
    90000,
    'yearly',
    false,
    NOW() - INTERVAL '2 days'
  ),
  (
    'j0b1d000-0000-0000-0000-000000000002',
    'c1a1e1f0-0000-0000-0000-000000000001',
    'Assistant Project Manager',
    'Join our team as an Assistant Project Manager supporting large-scale commercial construction projects. Great opportunity for field professionals looking to transition into management.',
    ARRAY[
      '5+ years construction experience',
      'Proven leadership ability',
      'Strong communication skills',
      'Experience with project scheduling',
      'Proficiency in Microsoft Office'
    ],
    ARRAY[
      'Support Project Manager in planning and execution',
      'Coordinate subcontractors and suppliers',
      'Track project budgets and schedules',
      'Prepare reports and documentation',
      'Assist with quality control'
    ],
    ARRAY[
      'Competitive salary',
      'Comprehensive benefits package',
      'Career advancement opportunities',
      'Training and certifications'
    ],
    'Madison, WI',
    'hybrid',
    'full_time',
    'mid',
    75000,
    95000,
    'yearly',
    false,
    NOW() - INTERVAL '5 days'
  ),
  (
    'j0b1d000-0000-0000-0000-000000000003',
    'c1a1e1f0-0000-0000-0000-000000000002',
    'Telecommunications Construction Manager',
    'Lead telecommunications infrastructure projects including tower construction and fiber deployment. Perfect for experienced foremen ready to move into project management.',
    ARRAY[
      '7+ years telecom construction experience',
      'Tower climbing certification',
      'Project management experience',
      'Strong safety record',
      'Crew leadership experience'
    ],
    ARRAY[
      'Manage multiple construction projects',
      'Oversee field crews and contractors',
      'Ensure quality and safety standards',
      'Coordinate with engineering teams',
      'Manage project budgets and timelines'
    ],
    ARRAY[
      'Excellent compensation package',
      'Remote work flexibility',
      'Health and wellness benefits',
      'Professional certifications paid',
      'Advancement opportunities'
    ],
    'Remote',
    'remote',
    'full_time',
    'senior',
    85000,
    110000,
    'yearly',
    false,
    NOW() - INTERVAL '1 day'
  ),
  (
    'j0b1d000-0000-0000-0000-000000000004',
    'c1a1e1f0-0000-0000-0000-000000000003',
    'Field Engineer',
    'Civil engineering role focused on field supervision and project coordination. Combines technical engineering with hands-on field management.',
    ARRAY[
      'Engineering degree or equivalent experience',
      '3+ years field experience',
      'AutoCAD or similar CAD software',
      'Strong problem-solving skills',
      'Excellent communication'
    ],
    ARRAY[
      'Conduct site inspections',
      'Review construction plans',
      'Coordinate with contractors',
      'Prepare technical reports',
      'Ensure compliance with specifications'
    ],
    ARRAY[
      'Competitive salary',
      'Health benefits',
      '401(k) matching',
      'Flexible schedule',
      'Professional development'
    ],
    'Madison, WI',
    'hybrid',
    'full_time',
    'mid',
    68000,
    85000,
    'yearly',
    false,
    NOW() - INTERVAL '4 days'
  ),
  (
    'j0b1d000-0000-0000-0000-000000000005',
    'c1a1e1f0-0000-0000-0000-000000000004',
    'Construction Coordinator',
    'Coordinate construction activities and manage project logistics. Great role for organized individuals with field construction background.',
    ARRAY[
      '2+ years construction experience',
      'Strong organizational skills',
      'Computer proficiency',
      'Attention to detail',
      'Team player'
    ],
    ARRAY[
      'Schedule and coordinate work',
      'Track materials and equipment',
      'Maintain project files',
      'Communicate with stakeholders',
      'Support project team'
    ],
    ARRAY[
      'Health insurance',
      'Paid time off',
      '401(k) plan',
      'Growth opportunities'
    ],
    'Appleton, WI',
    'onsite',
    'full_time',
    'entry',
    52000,
    65000,
    'yearly',
    false,
    NOW() - INTERVAL '7 days'
  );
