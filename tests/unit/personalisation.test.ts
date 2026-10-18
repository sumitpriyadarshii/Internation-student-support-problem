import { describe, it, expect } from 'vitest';

describe('Personalisation and Template Auto-Assignment Rules', () => {
  interface MockTemplate {
    id: string;
    title: string;
    destinationCountry?: string;
    dueDateOffsetDays: number;
    category: string;
  }

  const sampleTemplates: MockTemplate[] = [
    {
      id: 'tmpl-global-1',
      title: 'Valid Passport Check',
      destinationCountry: '',
      dueDateOffsetDays: -60,
      category: 'documentation-immigration',
    },
    {
      id: 'tmpl-us-1',
      title: 'Apply for F-1 Student Visa',
      destinationCountry: 'United States',
      dueDateOffsetDays: -45,
      category: 'documentation-immigration',
    },
    {
      id: 'tmpl-uk-1',
      title: 'UK Student Visa & TB Test',
      destinationCountry: 'United Kingdom',
      dueDateOffsetDays: -30,
      category: 'documentation-immigration',
    },
    {
      id: 'tmpl-ca-1',
      title: 'Apply for Canadian Study Permit',
      destinationCountry: 'Canada',
      dueDateOffsetDays: -40,
      category: 'documentation-immigration',
    },
    {
      id: 'tmpl-us-2',
      title: 'Open US Checking Account (Chase/BofA)',
      destinationCountry: 'United States',
      dueDateOffsetDays: 7,
      category: 'banking-financial',
    },
  ];

  it('selects global templates and matching destination templates for US student', () => {
    const studentDestination = 'United States';
    const destClean = studentDestination.trim().toLowerCase();

    const matched = sampleTemplates.filter((tmpl) => {
      if (!tmpl.destinationCountry || tmpl.destinationCountry.trim() === '') {
        return true;
      }
      return tmpl.destinationCountry.trim().toLowerCase() === destClean;
    });

    expect(matched).toHaveLength(3);
    const titles = matched.map((m) => m.title);
    expect(titles).toContain('Valid Passport Check');
    expect(titles).toContain('Apply for F-1 Student Visa');
    expect(titles).toContain('Open US Checking Account (Chase/BofA)');
    expect(titles).not.toContain('UK Student Visa & TB Test');
    expect(titles).not.toContain('Apply for Canadian Study Permit');
  });

  it('selects only global templates for student with unsupported destination', () => {
    const studentDestination = 'Germany';
    const destClean = studentDestination.trim().toLowerCase();

    const matched = sampleTemplates.filter((tmpl) => {
      if (!tmpl.destinationCountry || tmpl.destinationCountry.trim() === '') {
        return true;
      }
      return tmpl.destinationCountry.trim().toLowerCase() === destClean;
    });

    expect(matched).toHaveLength(1);
    expect(matched[0].title).toBe('Valid Passport Check');
  });

  it('calculates due dates relative to arrival date and offset days', () => {
    const arrivalDate = new Date('2026-09-01T00:00:00.000Z');
    const arrivalTime = arrivalDate.getTime();

    const tmplPreArrival = sampleTemplates.find((t) => t.id === 'tmpl-us-1')!;
    const dueDatePre = new Date(
      arrivalTime + tmplPreArrival.dueDateOffsetDays * 24 * 60 * 60 * 1000
    );

    // 45 days before Sept 1, 2026 => July 18, 2026
    expect(dueDatePre.toISOString().slice(0, 10)).toBe('2026-07-18');

    const tmplPostArrival = sampleTemplates.find((t) => t.id === 'tmpl-us-2')!;
    const dueDatePost = new Date(
      arrivalTime + tmplPostArrival.dueDateOffsetDays * 24 * 60 * 60 * 1000
    );

    // 7 days after Sept 1, 2026 => Sept 8, 2026
    expect(dueDatePost.toISOString().slice(0, 10)).toBe('2026-09-08');
  });
});
