export function getSubjectsForExam(exam: string = ''): string[] {
  const e = exam.toLowerCase();
  
  if (e.includes('upsc') || e.includes('civil services')) {
    return [
      'History', 'Geography', 'Polity', 'Economy', 
      'Environment', 'Science & Tech', 'Current Affairs', 
      'General Studies', 'CSAT'
    ];
  }
  if (e.includes('cat') || e.includes('mba')) {
    return [
      'Quantitative Aptitude', 'Logical Reasoning', 
      'Data Interpretation', 'Verbal Ability', 'Reading Comprehension'
    ];
  }
  if (e.includes('clat') || e.includes('law')) {
    return [
      'English Language', 'Current Affairs', 'Legal Reasoning', 
      'Logical Reasoning', 'Quantitative Techniques'
    ];
  }
  if (e.includes('jee') || e.includes('engineering')) {
    return ['Physics', 'Chemistry', 'Mathematics'];
  }
  if (e.includes('neet') || e.includes('medical')) {
    return ['Physics', 'Chemistry', 'Biology'];
  }
  if (e.includes('gate')) {
    return ['Engineering Mathematics', 'General Aptitude', 'Core Subject'];
  }
  if (e.includes('ssc') || e.includes('banking') || e.includes('ibps')) {
    return [
      'Quantitative Aptitude', 'Reasoning Ability', 
      'English Language', 'General Awareness', 'Computer Knowledge'
    ];
  }

  // Default fallback
  return [
    'Physics', 'Chemistry', 'Mathematics', 'Biology', 
    'Computer Science', 'General Studies', 'English'
  ];
}
