import { describe, it, expect } from 'vitest';
import { calculateMatchScore } from '@/lib/utils';

describe('Buddy Matching Algorithm', () => {
  it('calculates maximum match score when all criteria align perfectly', () => {
    const student = {
      languages: ['English', 'Spanish'],
      university: 'Oxford University',
      interests: ['coding', 'hiking', 'music'],
      supportPreferences: ['academic', 'housing'],
    };

    const buddy = {
      languages: ['English', 'Spanish'],
      university: 'Oxford University',
      interests: ['coding', 'hiking', 'music'],
      supportAreas: ['academic', 'housing'],
    };

    const score = calculateMatchScore(student, buddy);
    // Language: 30, University: 25, Interests: 20, Support: 15, Base: 10 => 100
    expect(score).toBe(100);
  });

  it('calculates base score when no preferences match and universities differ', () => {
    const student = {
      languages: ['Hindi'],
      university: 'Stanford',
      interests: ['cricket'],
      supportPreferences: ['financial'],
    };

    const buddy = {
      languages: ['Japanese'],
      university: 'Melbourne Uni',
      interests: ['art'],
      supportAreas: ['language'],
    };

    const score = calculateMatchScore(student, buddy);
    // Base score only: 10
    expect(score).toBe(10);
  });

  it('performs case-insensitive university matching', () => {
    const student = {
      languages: ['English'],
      university: 'UNIVERSITY OF TORONTO',
      interests: [],
      supportPreferences: [],
    };

    const buddy = {
      languages: ['English'],
      university: 'university of toronto',
      interests: [],
      supportAreas: [],
    };

    const score = calculateMatchScore(student, buddy);
    // Base 10 + Language 30 + University 25 = 65
    expect(score).toBe(65);
  });

  it('calculates partial language and interest overlaps accurately', () => {
    const student = {
      languages: ['English', 'French'],
      university: 'Harvard',
      interests: ['reading', 'chess', 'running', 'gaming'],
      supportPreferences: ['social'],
    };

    const buddy = {
      languages: ['English', 'German'], // 1 of 2 => 50% of 30 = 15
      university: 'MIT', // different => 0
      interests: ['chess', 'gaming'], // 2 of 4 => 50% of 20 = 10
      supportAreas: ['social', 'academic'], // 1 of 1 => 100% of 15 = 15
    };

    const score = calculateMatchScore(student, buddy);
    // Base: 10 + Language: 15 + Uni: 0 + Interests: 10 + Support: 15 = 50
    expect(score).toBe(50);
  });

  it('handles empty preference arrays safely without throwing errors', () => {
    const student = {
      languages: [],
      university: '',
      interests: [],
      supportPreferences: [],
    };

    const buddy = {
      languages: ['English'],
      university: 'Stanford',
      interests: ['sports'],
      supportAreas: ['academic'],
    };

    const score = calculateMatchScore(student, buddy);
    expect(score).toBe(10);
  });
});
