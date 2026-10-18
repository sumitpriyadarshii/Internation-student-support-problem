import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// -------------------------------------------------------------
// 1. Environment Variable Loader (Robust fallback for tsx/node)
// -------------------------------------------------------------
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    }
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/far-from-home';

// Import Mongoose Models
import {
  User,
  Guide,
  Task,
  TaskTemplate,
  BuddyProfile,
  BuddyRequest,
  CommunityEvent,
  EventRegistration,
  Notification,
  Bookmark,
} from '../src/models';

async function seed() {
  console.log('\n========================================');
  console.log('🌍 Far From Home - Database Seeder');
  console.log('========================================');
  const isForce = process.argv.includes('--force') || process.argv.includes('-f');
  console.log(`Connecting to MongoDB: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB successfully.\n');
  } catch (err: any) {
    console.error('Failed to connect to MongoDB:', err.message);
    console.error('Please ensure MongoDB is running and MONGODB_URI is correct in .env.local.');
    process.exit(1);
  }

  try {
    // -------------------------------------------------------------
    // Clear Existing Collections
    // -------------------------------------------------------------
    if (isForce) {
      console.log('⚡ --force flag provided: clearing existing database collections...');
    } else {
      console.log('Clearing existing data collections...');
    }
    await Promise.all([
      User.deleteMany({}),
      Guide.deleteMany({}),
      Task.deleteMany({}),
      TaskTemplate.deleteMany({}),
      BuddyProfile.deleteMany({}),
      BuddyRequest.deleteMany({}),
      CommunityEvent.deleteMany({}),
      EventRegistration.deleteMany({}),
      Notification.deleteMany({}),
      Bookmark.deleteMany({}),
    ]);
    console.log('Existing collections cleared.\n');

    // -------------------------------------------------------------
    // 1. Create Admin User
    // -------------------------------------------------------------
    console.log('Creating Admin User...');
    const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@farfromhome.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      onboardingCompleted: true,
      onboardingStep: 3,
      accountStatus: 'active',
      profile: {
        countryOfOrigin: 'USA',
        destinationCountry: 'USA',
        destinationCity: 'San Francisco',
        university: 'Global Admin Center',
        preferredLanguage: 'English',
        languagesSpoken: ['English', 'Spanish', 'French'],
        interests: ['Community Support', 'Immigration Policy', 'Education Tech'],
        supportPreferences: ['Administration'],
      },
    });
    console.log(`Admin created: admin@farfromhome.com (ID: ${adminUser._id})`);

    // -------------------------------------------------------------
    // 2. Create Sample Students (5)
    // -------------------------------------------------------------
    console.log('\nCreating Sample Students...');
    const studentPasswordHash = await bcrypt.hash('Student123!', 10);

    const now = new Date();
    const studentsData = [
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        profile: {
          countryOfOrigin: 'India',
          destinationCountry: 'USA',
          destinationCity: 'Stanford, CA',
          university: 'Stanford University',
          preferredLanguage: 'English',
          languagesSpoken: ['Hindi', 'English'],
          arrivalDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // arrived 20 days ago
          interests: ['technology', 'academics', 'coding', 'hiking'],
          supportPreferences: ['academic', 'financial', 'housing'],
        },
      },
      {
        name: 'Carlos Mendez',
        email: 'carlos.mendez@example.com',
        profile: {
          countryOfOrigin: 'Mexico',
          destinationCountry: 'UK',
          destinationCity: 'Oxford',
          university: 'University of Oxford',
          preferredLanguage: 'Spanish',
          languagesSpoken: ['Spanish', 'English'],
          arrivalDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // arrived 45 days ago
          interests: ['culture', 'sports', 'football', 'literature'],
          supportPreferences: ['language', 'social', 'cultural'],
        },
      },
      {
        name: 'Yuki Tanaka',
        email: 'yuki.tanaka@example.com',
        profile: {
          countryOfOrigin: 'Japan',
          destinationCountry: 'Australia',
          destinationCity: 'Melbourne',
          university: 'University of Melbourne',
          preferredLanguage: 'Japanese',
          languagesSpoken: ['Japanese', 'English'],
          arrivalDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // arrived 10 days ago
          interests: ['food', 'art', 'photography', 'coffee'],
          supportPreferences: ['housing', 'social', 'academic'],
        },
      },
      {
        name: 'Ahmed Hassan',
        email: 'ahmed.hassan@example.com',
        profile: {
          countryOfOrigin: 'Egypt',
          destinationCountry: 'Canada',
          destinationCity: 'Toronto',
          university: 'University of Toronto',
          preferredLanguage: 'Arabic',
          languagesSpoken: ['Arabic', 'English'],
          arrivalDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // arriving in 15 days
          interests: ['career', 'academics', 'machine learning', 'chess'],
          supportPreferences: ['housing', 'career', 'financial'],
        },
      },
      {
        name: 'Sophie Mueller',
        email: 'sophie.mueller@example.com',
        profile: {
          countryOfOrigin: 'Germany',
          destinationCountry: 'USA',
          destinationCity: 'Cambridge, MA',
          university: 'MIT',
          preferredLanguage: 'German',
          languagesSpoken: ['German', 'English'],
          arrivalDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // senior student (90 days ago)
          interests: ['technology', 'music', 'robotics', 'cycling'],
          supportPreferences: ['academic', 'social'],
        },
      },
    ];

    const students = await Promise.all(
      studentsData.map((s) =>
        User.create({
          name: s.name,
          email: s.email,
          passwordHash: studentPasswordHash,
          role: 'student',
          onboardingCompleted: true,
          onboardingStep: 3,
          accountStatus: 'active',
          profile: s.profile,
        })
      )
    );
    console.log(`Created ${students.length} students with password "Student123!"`);

    // -------------------------------------------------------------
    // 3. Create Sample Guides (16 Guides - 2 per Category)
    // -------------------------------------------------------------
    console.log('\nCreating Sample Guides (16 guides across 8 categories)...');
    const guidesData = [
      // 1. food-groceries
      {
        title: 'Navigating Grocery Stores and Ethnic Supermarkets in the USA',
        slug: 'grocery-stores-ethnic-supermarkets-usa',
        summary: 'How to find affordable groceries, discount supermarket chains like ALDI & Trader Joe’s, and locate authentic Asian, Halal, and Hispanic food markets.',
        content: `### Grocery Shopping in the United States

For international students, finding familiar ingredients while sticking to a budget is essential.

#### Mainstream Affordable Supermarkets
- **ALDI**: German discount chain known for private-label staples at 30-50% off typical supermarket prices. Bring a 25-cent coin for carts!
- **Trader Joe's**: Great for pre-cooked meals, affordable frozen produce, and international snacks.
- **Costco / Sam's Club**: Wholesale clubs. Split a membership with roommates to buy rice, paper towels, and cooking oil in bulk.

#### Locating Ethnic & Specialized Markets
- **H Mart & 99 Ranch Market**: Massive Asian supermarket chains stocking fresh spices, tofu, noodles, and specialty produce.
- **Patel Brothers**: Authentic Indian groceries, lentils, flour, and fresh herbs.
- **Local Bodegas & Carnicerias**: For fresh tortillas, dried chilies, and Latin American seasonings.
- **Halal Markets**: Search Google Maps for "Halal Meat Market" near campus.

#### Saving Tips
- Always sign up for free **store loyalty cards** (e.g., Safeway Club, Kroger Plus).
- Use digital coupon apps such as **Fetch** or **Ibotta** for cashback.`,
        category: 'food-groceries',
        applicableCountries: ['USA'],
        applicableRegions: ['North America'],
        tags: ['food', 'groceries', 'budget', 'ethnic markets', 'usa'],
        sourceUrl: 'https://www.fns.usda.gov',
        verificationStatus: 'verified',
        status: 'published',
      },
      {
        title: 'Student Food Shopping and Budget Supermarkets in the UK',
        slug: 'uk-student-food-shopping-budget-supermarkets',
        summary: 'The ultimate guide to supermarket tiers in the UK (Lidl, Tesco, Sainsbury’s), yellow sticker discount times, and student meal prepping.',
        content: `### Food Shopping in the United Kingdom

The UK grocery scene is divided into tiers based on price and quality.

#### Supermarket Tiers
1. **Budget (Cheapest)**: Lidl and Aldi offer the lowest baseline prices. Expect basic displays and private brands.
2. **Mid-Tier**: Tesco, ASDA, and Morrisons. Get a free **Tesco Clubcard** to unlock heavy discounts.
3. **Premium**: Sainsbury’s, Marks & Spencer (M&S), and Waitrose. Great for high quality, but pricier.

#### The Magic of "Yellow Stickers"
UK supermarkets discount items approaching expiration date by 20% to 75%:
- **First markdowns**: Around 2:00 PM - 4:00 PM (10-25% off)
- **Final markdowns (Yellow stickers)**: 7:00 PM - 8:30 PM (up to 75% off)
Look for the dedicated reduced shelf near the bakery and chilled meats.

#### App Recommendations
- **Too Good To Go**: Rescue surplus food bags from local bakeries and grocery stores for £3-£5.
- **Olio**: Free food sharing app connecting neighbors and local cafes.`,
        category: 'food-groceries',
        applicableCountries: ['UK'],
        applicableRegions: ['Europe', 'England', 'Scotland'],
        tags: ['groceries', 'uk', 'tesco', 'aldi', 'yellow stickers'],
        sourceUrl: 'https://www.moneysavingexpert.com',
        verificationStatus: 'verified',
        status: 'published',
      },

      // 2. banking-financial
      {
        title: 'Opening Your First Bank Account in the USA',
        slug: 'opening-first-bank-account-usa',
        summary: 'Documents required, checking vs savings accounts, wire transfers, and how to avoid monthly maintenance and overdraft fees.',
        content: `### Opening a US Student Bank Account

Setting up a local checking account is one of your first top-priority tasks upon arrival in the US.

#### Required Documents
1. **Valid Passport** with F-1/J-1 visa stamp.
2. **Form I-20 or DS-2019** issued by your university.
3. **Form I-94** arrival/departure record.
4. **Proof of US address** (lease agreement, dormitory letter, or utility bill).
5. **Student ID** or university admission letter.

#### Student-Friendly Banks
- **Chase**: Offers Chase College Checking (no monthly fee for up to 5 years for students aged 17–24).
- **Bank of America**: Student fee waivers and extensive ATM networks.
- **Capital One 360**: 100% free checking with no foreign transaction fees on debit cards.

#### Important Banking Tips
- **SSN Not Required Initially**: You can open a bank account without a Social Security Number. Once you secure on-campus employment and receive an SSN, update your bank.
- **Wire Transfers**: Request your bank's international wire routing number (SWIFT/BIC code) and your full 10-12 digit account number.`,
        category: 'banking-financial',
        applicableCountries: ['USA'],
        applicableRegions: ['North America'],
        tags: ['banking', 'finance', 'checking', 'usa', 'ssn'],
        sourceUrl: 'https://www.consumerfinance.gov',
        verificationStatus: 'verified',
        status: 'published',
      },
      {
        title: 'Setting Up a UK Student Bank Account & Monzo/Revolut',
        slug: 'setting-up-uk-student-bank-account',
        summary: 'Comparing high-street banks (Barclays, HSBC) with digital banks like Monzo and Starling for international students in the UK.',
        content: `### Banking Guide for International Students in the UK

#### Digital Banks (Quickest Setup)
- **Monzo**: Can be opened within 15 minutes via mobile app. Requires passport and UK address. Great budgeting tools and instant push notifications.
- **Starling Bank**: Award-winning digital bank with zero foreign transaction fees and free cash deposits at Post Offices.
- **Revolut**: Multi-currency account perfect for holding EUR, USD, and GBP simultaneously.

#### Traditional High-Street Banks
- **Barclays & HSBC**: Often provide letters and accounts directly affiliated with university welcome packs.
- Required: **Bank Letter from University Registry** stating your current UK term-time address and course duration.

#### Key Traps to Avoid
- Never carry large amounts of cash.
- Ensure your UK account has an active sort code (6 digits) and account number (8 digits) for Faster Payments.`,
        category: 'banking-financial',
        applicableCountries: ['UK'],
        applicableRegions: ['Europe'],
        tags: ['banking', 'monzo', 'uk', 'hsbc', 'finance'],
        sourceUrl: 'https://www.ukcisa.org.uk',
        verificationStatus: 'verified',
        status: 'published',
      },

      // 3. sim-mobile
      {
        title: 'Getting a SIM Card & Mobile Plan in Australia',
        slug: 'sim-card-mobile-plan-australia',
        summary: 'Comparing Telstra, Optus, and Vodafone networks, MVNO prepaid SIM cards (Aldi Mobile, Moose), and campus Wi-Fi setups.',
        content: `### Mobile Service in Australia

#### Major Mobile Networks
1. **Telstra**: Widest network coverage across rural and regional Australia. Pricier.
2. **Optus**: Strong suburban and city coverage; popular student plans.
3. **Vodafone**: Budget friendly with generous international roaming and overseas call minutes.

#### Mobile Virtual Network Operators (MVNOs)
MVNOs use the major networks but charge half the price:
- **ALDI Mobile** (uses Telstra network): Outstanding value starting at AUD $15/month with data rollover.
- **Woolworths Mobile** (uses Telstra): Includes 10% off grocery shopping once a month.
- **Boost Mobile**: The only MVNO with full access to the complete Telstra 5G retail network.

#### What You Need to Buy a Prepaid SIM
- Unlocked smartphone.
- Passport for online identity verification (mandatory under Australian federal law).
- Credit/debit card or cash voucher.`,
        category: 'sim-mobile',
        applicableCountries: ['Australia'],
        applicableRegions: ['Oceania'],
        tags: ['sim', 'mobile', 'telstra', 'australia', 'optus'],
        sourceUrl: 'https://www.acma.gov.au',
        verificationStatus: 'verified',
        status: 'published',
      },
      {
        title: 'Best US Mobile Carriers and eSIM Options for Students',
        slug: 'best-us-mobile-carriers-esim-students',
        summary: 'Avoid expensive contracts: how to pick between Mint Mobile, T-Mobile Connect, and Visible with eSIM instant activation.',
        content: `### US Mobile Phone Plans & eSIM Activation

Most international students do not have US credit history, making traditional post-paid carrier contracts uneconomical due to required security deposits.

#### Top Recommended Prepaid & MVNO Plans
- **Mint Mobile** (T-Mobile network): Starting at $15/month for 5GB or $30/month for Unlimited. Bring your own phone and activate an eSIM before boarding your flight!
- **Visible by Verizon**: $25/month for truly unlimited data, hotspot included, on Verizon’s premium network.
- **T-Mobile Prepaid**: Excellent urban speeds and simple in-store physical SIM swaps at airport branches.

#### What is an eSIM?
An embedded digital SIM that lets you activate cellular data without waiting for a physical plastic card. Ensure your phone is unlocked and compatible (iPhone XS or newer, Samsung Galaxy S20+).`,
        category: 'sim-mobile',
        applicableCountries: ['USA'],
        applicableRegions: ['North America'],
        tags: ['sim', 'mobile', 'esim', 'mint mobile', 'usa'],
        sourceUrl: 'https://www.fcc.gov',
        verificationStatus: 'verified',
        status: 'published',
      },

      // 4. documentation-immigration
      {
        title: 'Maintaining F-1 Student Visa Status in the United States',
        slug: 'maintaining-f1-student-visa-status-usa',
        summary: 'Full course of study requirements, Form I-20 travel signatures, SEVIS regulations, and on-campus work hour limitations.',
        content: `### Crucial Rules for F-1 Visa Holders in the USA

Failing to maintain your visa status can result in severe immigration consequences. Keep these foundational requirements in mind:

#### 1. Full-Time Enrollment Requirement
- Undergraduates: At least 12 credit units per semester.
- Graduates: Typically 8-9 credit units (check your department).
- **Online Course Limit**: Only one online/distance class (up to 3 credits) may count toward your full-time enrollment requirement per semester.

#### 2. Employment Restrictions
- **On-Campus Work**: Up to 20 hours per week during regular academic terms; up to 40 hours during recognized university breaks.
- **Off-Campus Work**: Strictly prohibited without prior CPT (Curricular Practical Training) or OPT (Optional Practical Training) authorization from your DSO/USCIS.

#### 3. International Travel Rules
- Always obtain a **Travel Signature** on page 2 of your Form I-20 from your International Student Office before traveling abroad. Travel signatures are valid for 12 months (6 months if on post-completion OPT).
- Keep your passport valid for at least 6 months into the future at all times.`,
        category: 'documentation-immigration',
        applicableCountries: ['USA'],
        applicableRegions: ['North America'],
        tags: ['visa', 'f1', 'immigration', 'i20', 'sevis', 'dso'],
        sourceUrl: 'https://studyinthestates.dhs.gov',
        verificationStatus: 'verified',
        status: 'published',
      },
      {
        title: 'Canada Study Permit Rules and Post-Graduation Work Permits (PGWP)',
        slug: 'canada-study-permit-rules-pgwp',
        summary: 'Essential conditions of Canadian Study Permits, working hours regulations, and qualifying for the Post-Graduation Work Permit (PGWP).',
        content: `### Studying and Working Legally in Canada

Canada provides transparent immigration pathways for international graduates through Designated Learning Institutions (DLIs).

#### Study Permit Conditions
- Must remain continuously enrolled at a DLI and make active progress toward course completion.
- Must inform IRCC if changing institutions.
- Keep valid health insurance coverage throughout your studies.

#### Off-Campus Work Regulations
- International students enrolled in qualifying programs can work off-campus up to **24 hours per week** during academic terms.
- Unlimited hours during scheduled semester breaks and summer holidays.
- You must have a valid **Social Insurance Number (SIN)** before your first working day.

#### Post-Graduation Work Permit (PGWP)
- An open work permit allowing graduates to work for any Canadian employer.
- Duration: Between 8 months and up to 3 years depending on the length of your academic program.`,
        category: 'documentation-immigration',
        applicableCountries: ['Canada'],
        applicableRegions: ['North America'],
        tags: ['canada', 'study permit', 'pgwp', 'ircc', 'sin'],
        sourceUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship.html',
        verificationStatus: 'verified',
        status: 'published',
      },

      // 5. university-campus
      {
        title: 'Navigating Campus Life and Facilities in Australia',
        slug: 'campus-life-facilities-australia',
        summary: 'Library reservations, campus student unions, academic writing centers, and accessing mental health support on Aussie campuses.',
        content: `### Maximizing Your Australian University Experience

Australian universities emphasize self-directed learning and campus community balance.

#### Essential Campus Services
- **Academic Skills Units**: Free one-on-one essay editing, referencing workshops (APA, Harvard), and exam preparation tutorials.
- **Student Guild / Union**: Organizes orientation festivals (O-Week), clubs, free weekly breakfasts, and legal advisory services.
- **University Counseling Services**: Most Australian universities provide 6 to 10 free, confidential psychological therapy sessions per calendar year.

#### Class Structures
- **Lectures**: Large theatre presentations delivering core theoretical concepts.
- **Tutorials / Tutes**: Small interactive classes (15-25 students) where active participation and group debates constitute up to 10-20% of your grade.
- **Workshops / Labs**: Hands-on application for STEM and technical fields.`,
        category: 'university-campus',
        applicableCountries: ['Australia'],
        applicableRegions: ['Oceania'],
        tags: ['campus', 'australia', 'tutorials', 'student union', 'o-week'],
        sourceUrl: 'https://www.universitiesaustralia.edu.au',
        verificationStatus: 'verified',
        status: 'published',
      },
      {
        title: 'UK University Academic System: Seminars, Tutorials & Grading',
        slug: 'uk-university-academic-system-grading',
        summary: 'Understanding the UK degree classification (First, 2:1, 2:2), reading lists, academic referencing, and tutorial expectations.',
        content: `### Thriving in the British Higher Education System

The UK academic environment values independent research and critical thinking over memorization.

#### The UK Grading Scale Demystified
- **First-Class Honours (1st)**: 70%+ (Marks above 75% are considered publishable work).
- **Upper Second-Class (2:1)**: 60%–69% (The target requirement for most graduate corporate employment programs).
- **Lower Second-Class (2:2)**: 50%–59%.
- **Third-Class (3rd)**: 40%–49% (Pass benchmark).

#### Independent Reading
Your professors will assign extensive "suggested reading lists." Lectures serve merely as outlines; your essays and exams are expected to cite scholarly monographs and journal articles retrieved through the university library databases.`,
        category: 'university-campus',
        applicableCountries: ['UK'],
        applicableRegions: ['Europe'],
        tags: ['uk', 'grading', 'seminars', 'university', 'first class'],
        sourceUrl: 'https://www.qaa.ac.uk',
        verificationStatus: 'verified',
        status: 'published',
      },

      // 6. accommodation-transport
      {
        title: 'Student Housing and Apartment Renting Guide for Canada',
        slug: 'student-housing-apartment-renting-canada',
        summary: 'On-campus dorms vs off-campus leases, tenant rights, standard lease agreements, avoiding rental scams, and utilities.',
        content: `### Renting Accommodation in Canada

Finding safe, affordable housing in cities like Toronto, Vancouver, or Montreal requires vigilance and prompt action.

#### Types of Student Accommodation
1. **University Residence (Dorms)**: Convenient, fully furnished, includes meal plans, but often pricier and limited to first-year students.
2. **Student Apartments / Off-Campus Co-Living**: Shared suites with individual bedrooms and shared kitchen/bathrooms.
3. **Basement Suites & Private Condos**: Common in suburban areas. Always verify proper fire egress windows.

#### Spotting & Avoiding Rental Scams
- **Red Flag 1**: The landlord claims to be "out of the country" and asks for wire transfer or gift cards before viewing.
- **Red Flag 2**: The rent price is significantly below fair market value for the neighborhood.
- **Rule of Thumb**: Never pay a deposit without a physical or verified live-video walk-through and signing the official Provincial Standard Lease agreement.`,
        category: 'accommodation-transport',
        applicableCountries: ['Canada'],
        applicableRegions: ['North America'],
        tags: ['housing', 'canada', 'rent', 'lease', 'apartment'],
        sourceUrl: 'https://www.cmhc-schl.gc.ca',
        verificationStatus: 'verified',
        status: 'published',
      },
      {
        title: 'Public Transit & Commuting in Major US Student Metros',
        slug: 'public-transit-commuting-us-student-metros',
        summary: 'Navigating subway systems, university transit passes (U-Pass), cycling infrastructure, and rideshare safety.',
        content: `### Getting Around Without a Car in the USA

While the US is car-centric in suburban regions, student hubs feature robust transit options.

#### Transit Systems in Major Student Cities
- **Boston (MBTA 'T')**: Subway, trolley, and bus network connecting Harvard, MIT, Boston University, and Northeastern.
- **New York City (MTA)**: 24/7 subway system. Use contactless OMNY payments with your phone.
- **San Francisco Bay Area (BART & Muni)**: Connects UC Berkeley, Stanford, and SFSU via Clipper cards.
- **Chicago (CTA 'L')**: Extensive elevated trains and buses.

#### University U-Pass Programs
Many universities partner with municipal transit agencies to bundle deeply discounted or free semester passes directly into student tuition fees. Check your student ID card activation guidelines.`,
        category: 'accommodation-transport',
        applicableCountries: ['USA'],
        applicableRegions: ['North America'],
        tags: ['transport', 'transit', 'subway', 'usa', 'commuting'],
        sourceUrl: 'https://www.transit.dot.gov',
        verificationStatus: 'verified',
        status: 'published',
      },

      // 7. healthcare-emergency
      {
        title: 'Understanding US Health Insurance (SSN, Co-pays & Deductibles)',
        slug: 'understanding-us-health-insurance-students',
        summary: 'Demystifying the American healthcare system: in-network vs out-of-network, urgent care vs emergency rooms, and university plans.',
        content: `### Navigating the US Healthcare System

The American medical system can be confusing and costly without adequate insurance comprehension.

#### Essential Terminology
- **Premium**: The base cost you pay (usually per semester) to maintain insurance coverage.
- **Deductible**: The amount you must pay out-of-pocket before your insurance begins covering medical expenses.
- **Co-pay**: A fixed flat fee (e.g. $20 for a doctor visit, $15 for a prescription) paid at the time of care.
- **In-Network vs. Out-of-Network**: In-network doctors have negotiated rates with your insurer. Always confirm your provider is In-Network to avoid surprise billing.

#### Where to Seek Medical Care
1. **Student Health Center**: Your first stop for colds, minor injuries, vaccines, and prescriptions. Usually covered 100% by student health fees.
2. **Urgent Care Clinics**: For after-hours minor emergencies (sprains, minor stitches, fever). Co-pays usually $30–$75.
3. **Emergency Room (ER)**: STRICTLY for life-threatening conditions. Call 911. ER visits without severe trauma can cost thousands out-of-pocket.`,
        category: 'healthcare-emergency',
        applicableCountries: ['USA'],
        applicableRegions: ['North America'],
        tags: ['healthcare', 'insurance', 'usa', 'emergency', 'copay'],
        sourceUrl: 'https://www.healthcare.gov',
        verificationStatus: 'verified',
        status: 'published',
      },
      {
        title: 'Registering with the UK NHS and Accessing Free Healthcare',
        slug: 'registering-uk-nhs-free-healthcare',
        summary: 'How to register with a General Practitioner (GP), accessing NHS 111, obtaining emergency prescriptions, and dentistry costs.',
        content: `### Accessing NHS Care as an International Student in the UK

International students on student visas who paid the **Immigration Health Surcharge (IHS)** are entitled to free National Health Service (NHS) hospital and GP consultations.

#### How to Register with a Local GP
1. Find a GP surgery near your university dorm or apartment using the NHS Find a GP tool.
2. Fill out form **GMS1** online or in person.
3. Bring your Passport, BRP/e-Visa share code, and Proof of Address.
4. You will receive an **NHS Number** by post within 1-2 weeks.

#### When to Call 111 vs 999
- **NHS 111**: Free 24/7 medical advice hotline when you are unsure what treatment you need.
- **999**: Emergency ambulance services for life-threatening emergencies only.`,
        category: 'healthcare-emergency',
        applicableCountries: ['UK'],
        applicableRegions: ['Europe'],
        tags: ['nhs', 'healthcare', 'uk', 'gp', 'doctor'],
        sourceUrl: 'https://www.nhs.uk',
        verificationStatus: 'verified',
        status: 'published',
      },

      // 8. local-culture-language
      {
        title: 'Australian Slang, Culture and Campus Etiquette for Beginners',
        slug: 'australian-slang-culture-campus-etiquette',
        summary: 'Decoding "G’day", "Arvo", flat whites, beach safety (flags), tipping etiquette, and egalitarian communication with lecturers.',
        content: `### Cultural Survival Guide: Life in Australia

Australian culture is famously egalitarian, informal, and friendly.

#### Common Aussie Lingo You Will Hear Daily
- **G'day**: Hello!
- **Arvo**: Afternoon ("See you this arvo").
- **Brekkie**: Breakfast.
- **No worries**: You are welcome / Everything is fine.
- **Uni**: University.
- **Flat White**: Australia’s signature espresso coffee drink.

#### Communicating with Lecturers
In Australia, hierarchy is minimal. Most professors and lecturers prefer you to call them by their first name (e.g., "Hi Sarah" rather than "Professor Johnson"). Don't hesitate to ask questions during office hours.

#### Tipping Culture
Tipping is **NOT** required or customary in Australia. Restaurant and cafe staff are paid fair minimum wages under National Modern Awards.`,
        category: 'local-culture-language',
        applicableCountries: ['Australia'],
        applicableRegions: ['Oceania'],
        tags: ['culture', 'australia', 'slang', 'etiquette', 'lifestyle'],
        sourceUrl: 'https://www.australia.com',
        verificationStatus: 'verified',
        status: 'published',
      },
      {
        title: 'Adapting to Canadian Winter and Multicultural Social Norms',
        slug: 'adapting-to-canadian-winter-multicultural-norms',
        summary: 'Layering strategies, buying winter boots (ice grips), seasonal affective disorder, Canadian politeness, and multicultural cuisine.',
        content: `### Surviving Canadian Winters & Social Etiquette

Canadian winters can drop below -20°C (-4°F), but with the right preparation, winter is enjoyable!

#### The Three-Layer Rule
1. **Base Layer (Thermal)**: Moisture-wicking merino wool or polyester long underwear. Avoid cotton as it traps sweat and chills you.
2. **Mid Layer (Insulation)**: Fleece jacket, wool sweater, or lightweight down.
3. **Outer Shell (Weatherproof)**: Windproof and waterproof winter parka with a deep hood.

#### Footwear is Critical
Invest in waterproof winter boots rated for -20°C with non-slip rubber soles to prevent slipping on black ice.

#### Canadian Social Customs
Canadians are renowned for politeness and apologizing ("Sorry!"). Holding doors open for the person behind you is universally expected.`,
        category: 'local-culture-language',
        applicableCountries: ['Canada'],
        applicableRegions: ['North America'],
        tags: ['canada', 'winter', 'culture', 'clothing', 'politeness'],
        sourceUrl: 'https://www.canada.ca/en/environment-climate-change.html',
        verificationStatus: 'verified',
        status: 'published',
      },
    ];

    const guides: any[] = [];
    for (const g of guidesData) {
      const created = await Guide.create({
        ...g,
        createdBy: adminUser._id,
        lastVerifiedAt: new Date(),
      });
      guides.push(created);
    }
    console.log(`Created ${guides.length} published survival guides.`);

    // -------------------------------------------------------------
    // 4. Create Task Templates (12 Templates)
    // -------------------------------------------------------------
    console.log('\nCreating Task Templates (12 destination-specific & global templates)...');
    const templatesData = [
      {
        title: 'Apply for Student Visa & Schedule Consular Interview',
        description: 'Complete DS-160 / CAS / Study Permit application and book consular biometric appointment.',
        category: 'documentation-immigration',
        required: true,
        defaultPriority: 'urgent',
        dueDateOffsetDays: -60,
      },
      {
        title: 'Secure Accommodation / Sign Rental Agreement',
        description: 'Finalize university dorm room assignment or sign certified off-campus lease agreement.',
        category: 'accommodation-transport',
        required: true,
        defaultPriority: 'high',
        dueDateOffsetDays: -30,
      },
      {
        title: 'Book International Flight & Arrange Airport Pickup',
        description: 'Confirm travel dates matching dorm check-in schedules and coordinate university shuttle.',
        category: 'accommodation-transport',
        required: false,
        defaultPriority: 'high',
        dueDateOffsetDays: -21,
      },
      {
        title: 'Purchase Local SIM Card & Set Up Data Plan',
        description: 'Get local cellular data and active phone number for emergency contacts and bank verification.',
        category: 'sim-mobile',
        required: true,
        defaultPriority: 'high',
        dueDateOffsetDays: 1,
      },
      {
        title: 'Open Local Bank Account & Transfer Living Expenses',
        description: 'Visit on-campus branch with passport, visa, I-20/CAS, and proof of residence to set up checking.',
        category: 'banking-financial',
        destinationCountry: 'USA',
        required: true,
        defaultPriority: 'urgent',
        dueDateOffsetDays: 3,
      },
      {
        title: 'Register with University Registrar & Collect Student ID Card',
        description: 'Complete in-person immigration check-in with your DSO/Registry and receive physical student card.',
        category: 'university-campus',
        required: true,
        defaultPriority: 'urgent',
        dueDateOffsetDays: 2,
      },
      {
        title: 'Enroll in Mandatory Student Health Insurance Plan',
        description: 'Verify health coverage waivers or complete enrollment in the university medical insurance plan.',
        category: 'healthcare-emergency',
        destinationCountry: 'USA',
        required: true,
        defaultPriority: 'high',
        dueDateOffsetDays: 5,
      },
      {
        title: 'Register with Local GP (NHS) Surgery',
        description: 'Register with neighborhood General Practitioner clinic for primary care and NHS access.',
        category: 'healthcare-emergency',
        destinationCountry: 'UK',
        required: true,
        defaultPriority: 'high',
        dueDateOffsetDays: 7,
      },
      {
        title: 'Set Up Public Transit Pass & Student Discount Card',
        description: 'Link student status with regional transit network (Opal, MBTA, Oyster) for discount fares.',
        category: 'accommodation-transport',
        required: false,
        defaultPriority: 'medium',
        dueDateOffsetDays: 4,
      },
      {
        title: 'Attend International Student Orientation Week (O-Week)',
        description: 'Join campus tours, safety seminars, club fairs, and welcome mixer events.',
        category: 'university-campus',
        required: true,
        defaultPriority: 'medium',
        dueDateOffsetDays: 0,
      },
      {
        title: 'Apply for Social Security Number (SSN) / Social Insurance (SIN)',
        description: 'Obtain employment identification number after securing on-campus student position.',
        category: 'documentation-immigration',
        required: false,
        defaultPriority: 'medium',
        dueDateOffsetDays: 30,
      },
      {
        title: 'Stock Essential Groceries & Locate Ethnic Food Markets',
        description: 'Find local discount supermarkets and source specialty cooking ingredients from home.',
        category: 'food-groceries',
        required: false,
        defaultPriority: 'low',
        dueDateOffsetDays: 5,
      },
    ];

    const templates: any[] = [];
    for (const t of templatesData) {
      const created = await TaskTemplate.create({
        ...t,
        active: true,
      });
      templates.push(created);
    }
    console.log(`Created ${templates.length} task templates.`);

    // -------------------------------------------------------------
    // 5. Create Sample Tasks Assigned to Students
    // -------------------------------------------------------------
    console.log('\nAssigning Sample Tasks to Students...');
    let taskCount = 0;

    for (const student of students) {
      const arrival = student.profile?.arrivalDate ? new Date(student.profile.arrivalDate) : now;

      // Assign first 6 templates to each student with realistic statuses
      for (let i = 0; i < 6; i++) {
        const tpl = templates[i];
        const taskDue = new Date(arrival.getTime() + tpl.dueDateOffsetDays * 24 * 60 * 60 * 1000);
        const isPastDue = taskDue < now;

        // Mix of statuses
        let status: 'completed' | 'in-progress' | 'not-started' = 'not-started';
        let completedAt: Date | undefined = undefined;

        if (i === 0) {
          // Visa task usually completed if student arrived
          status = 'completed';
          completedAt = new Date(taskDue.getTime() - 5 * 24 * 60 * 60 * 1000);
        } else if (i === 1) {
          // Housing usually completed or in progress
          status = 'completed';
          completedAt = new Date(taskDue.getTime() - 2 * 24 * 60 * 60 * 1000);
        } else if (i === 2) {
          status = isPastDue ? 'completed' : 'in-progress';
          if (status === 'completed') completedAt = new Date();
        } else if (i === 3) {
          // SIM card
          status = isPastDue ? 'in-progress' : 'not-started'; // Some will be overdue!
        } else if (i === 4) {
          // Banking
          status = isPastDue ? 'not-started' : 'in-progress'; // Intentionally overdue for testing
        } else {
          status = 'not-started';
        }

        await Task.create({
          userId: student._id,
          templateId: tpl._id,
          title: tpl.title,
          description: tpl.description,
          category: tpl.category,
          priority: tpl.defaultPriority,
          dueDate: taskDue,
          status,
          completedAt,
        });
        taskCount++;
      }
    }
    console.log(`Assigned ${taskCount} tasks across ${students.length} students (including overdue tasks).`);

    // -------------------------------------------------------------
    // 6. Create Buddy Profiles (All 5 Students Approved)
    // -------------------------------------------------------------
    console.log('\nCreating Buddy Profiles for all students (approved)...');
    const buddyBios = [
      'Second-year MS in CS at Stanford. Excited to help new Indian students find cheap housing and understand Silicon Valley internships!',
      'DPhil student at Oxford. Passionate about British football, academic essay writing, and helping newcomers adapt to college life.',
      'Undergraduate senior at University of Melbourne. Coffee enthusiast and foodie! Happy to show you around Melbourne laneways and tram networks.',
      'Graduate researcher at U of T. Let me help you navigate Toronto cold weather, subway passes, and software co-op positions.',
      'Third-year mechanical engineering major at MIT. I mentor new European & international scholars with lab culture and Boston transport.',
    ];

    const buddyProfiles = await Promise.all(
      students.map((student, idx) =>
        BuddyProfile.create({
          userId: student._id,
          university: student.profile?.university || 'University',
          languages: student.profile?.languagesSpoken || ['English'],
          interests: student.profile?.interests || ['Culture', 'Academics'],
          supportAreas: ['academic', 'cultural', 'housing', 'social'].slice(0, (idx % 3) + 2) as any,
          availability: idx % 2 === 0 ? 'available' : 'busy',
          biography: buddyBios[idx],
          approvalStatus: 'approved',
        })
      )
    );
    console.log(`Created ${buddyProfiles.length} approved buddy profiles.`);

    // -------------------------------------------------------------
    // 7. Create Sample Buddy Requests (4 Requests)
    // -------------------------------------------------------------
    console.log('\nCreating Sample Buddy Requests...');
    const requestsData = [
      {
        requesterId: students[0]._id, // Priya
        recipientId: students[4]._id, // Sophie
        message: 'Hi Sophie! I saw you are studying nearby in Cambridge and love tech. Would love some tips on navigating US grad school seminars!',
        status: 'accepted' as const,
      },
      {
        requesterId: students[1]._id, // Carlos
        recipientId: students[3]._id, // Ahmed
        message: 'Hola Ahmed! Would love to connect regarding campus life and adjusting to winter term.',
        status: 'pending' as const,
      },
      {
        requesterId: students[2]._id, // Yuki
        recipientId: students[0]._id, // Priya
        message: 'Hi Priya, loved your profile! Do you have any recommendations for affordable campus grocery shopping?',
        status: 'accepted' as const,
      },
      {
        requesterId: students[3]._id, // Ahmed
        recipientId: students[1]._id, // Carlos
        message: 'Hey Carlos, reaching out to see if you have experience with cross-cultural student clubs.',
        status: 'rejected' as const,
      },
    ];

    const buddyRequests = await Promise.all(
      requestsData.map((r) =>
        BuddyRequest.create({
          ...r,
        })
      )
    );
    console.log(`Created ${buddyRequests.length} buddy requests (accepted, pending, rejected).`);

    // -------------------------------------------------------------
    // 8. Create Community Events (8 Events)
    // -------------------------------------------------------------
    console.log('\nCreating Community Events (8 events)...');
    const eventsData = [
      {
        title: 'International Student Welcome & Food Festival',
        description: 'Taste authentic dishes prepared by international student associations and meet peer mentors.',
        category: 'food-cooking' as const,
        location: 'Student Union Grand Plaza',
        startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // in 5 days
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        capacity: 100,
        status: 'upcoming' as const,
      },
      {
        title: 'Global Language Exchange & Coffee Hour',
        description: 'Practice Spanish, Japanese, German, Hindi, and English over artisanal coffee and snacks.',
        category: 'language-practice' as const,
        location: 'Campus Cafe & Lounge B',
        startDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), // in 8 days
        endDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        capacity: 40,
        status: 'upcoming' as const,
      },
      {
        title: 'Campus Walking Tour & Hidden Gem Hunt',
        description: 'Explore quiet library study rooms, best budget food spots, and historic architectural corners.',
        category: 'campus-orientation' as const,
        location: 'Main University Bell Tower',
        startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        capacity: 30,
        status: 'upcoming' as const,
      },
      {
        title: 'International Career Networking & Resume Clinic',
        description: 'Learn how to tailor your CV to Western employer expectations and master behavioral interviews.',
        category: 'career-networking' as const,
        location: 'Career Center Auditorium Room 102',
        startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        capacity: 60,
        status: 'upcoming' as const,
      },
      {
        title: 'Weekend City Exploration: Landmarks & Museums',
        description: 'Join a group metro ride to visit downtown galleries, open-air markets, and coastal viewpoints.',
        category: 'local-exploration' as const,
        location: 'Central Metro Station Entrance',
        startDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
        capacity: 25,
        status: 'upcoming' as const,
      },
      {
        title: 'Cultural Heritage Night & Traditional Music',
        description: 'Celebrate our diverse student community with traditional attire, performances, and folk dance.',
        category: 'cultural-exchange' as const,
        location: 'University Performing Arts Center',
        startDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        capacity: 150,
        status: 'upcoming' as const,
      },
      {
        title: 'Friendly Intramural Soccer & Sports Meetup',
        description: 'Casual 5-a-side football matches for fun and fitness. All skill levels welcome!',
        category: 'sports-recreation' as const,
        location: 'South Recreational Turf Fields',
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Past event
        endDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        capacity: 30,
        status: 'completed' as const,
      },
      {
        title: 'Fall Welcome Bonfire & Stargazing',
        description: 'Cozy evening fireside gathering with marshmallows, hot cider, and acoustic guitar music.',
        category: 'cultural-exchange' as const,
        location: 'Lakeside Fire Pit Park',
        startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // Past event
        endDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        capacity: 50,
        status: 'completed' as const,
      },
    ];

    const communityEvents = await Promise.all(
      eventsData.map((e) =>
        CommunityEvent.create({
          ...e,
          organiserId: adminUser._id,
          registrationCount: 0,
        })
      )
    );
    console.log(`Created ${communityEvents.length} community events.`);

    // -------------------------------------------------------------
    // 9. Create Event Registrations
    // -------------------------------------------------------------
    console.log('\nRegistering students for events...');
    let regCount = 0;

    // Register Priya & Carlos to Food Festival
    await EventRegistration.create({
      eventId: communityEvents[0]._id,
      userId: students[0]._id,
      registrationStatus: 'registered',
    });
    await EventRegistration.create({
      eventId: communityEvents[0]._id,
      userId: students[1]._id,
      registrationStatus: 'registered',
    });
    await CommunityEvent.findByIdAndUpdate(communityEvents[0]._id, { $inc: { registrationCount: 2 } });
    regCount += 2;

    // Register Yuki & Sophie to Language Exchange
    await EventRegistration.create({
      eventId: communityEvents[1]._id,
      userId: students[2]._id,
      registrationStatus: 'registered',
    });
    await EventRegistration.create({
      eventId: communityEvents[1]._id,
      userId: students[4]._id,
      registrationStatus: 'registered',
    });
    await CommunityEvent.findByIdAndUpdate(communityEvents[1]._id, { $inc: { registrationCount: 2 } });
    regCount += 2;

    // Register Ahmed to Career Networking
    await EventRegistration.create({
      eventId: communityEvents[3]._id,
      userId: students[3]._id,
      registrationStatus: 'registered',
    });
    await CommunityEvent.findByIdAndUpdate(communityEvents[3]._id, { $inc: { registrationCount: 1 } });
    regCount += 1;

    console.log(`Created ${regCount} event registrations.`);

    // -------------------------------------------------------------
    // 10. Create Notifications (8 Notifications)
    // -------------------------------------------------------------
    console.log('\nCreating Sample Notifications...');
    const notificationsData = [
      {
        userId: students[0]._id, // Priya
        title: 'Task Reminder: Bank Account Setup',
        message: 'Your task "Open Local Bank Account" is approaching its due date. View the guide for branch details.',
        type: 'task-reminder' as const,
        readAt: null,
      },
      {
        userId: students[4]._id, // Sophie
        title: 'New Buddy Request from Priya Sharma',
        message: 'Priya Sharma requested to connect with you for academic & technology mentoring.',
        type: 'buddy-request' as const,
        readAt: new Date(),
      },
      {
        userId: students[1]._id, // Carlos
        title: 'Event Reminder: International Food Festival',
        message: 'The International Student Welcome & Food Festival starts in 5 days! Don’t forget your student badge.',
        type: 'event-update' as const,
        readAt: null,
      },
      {
        userId: students[2]._id, // Yuki
        title: 'New Survival Guide: SIM Cards in Australia',
        message: 'A newly verified guide on mobile operators in Melbourne has been published.',
        type: 'guide-update' as const,
        readAt: null,
      },
      {
        userId: students[3]._id, // Ahmed
        title: 'Welcome to Far From Home!',
        message: 'Welcome to your personalized student portal. Check out your pre-arrival checklists to get started.',
        type: 'system' as const,
        readAt: new Date(),
      },
      {
        userId: students[0]._id, // Priya
        title: 'Buddy Connection Confirmed!',
        message: 'Sophie Mueller accepted your buddy connection request. You can now exchange direct notes.',
        type: 'buddy-request' as const,
        readAt: null,
      },
      {
        userId: students[1]._id, // Carlos
        title: 'Overdue Checklist Item',
        message: 'Your pre-arrival task "Purchase Local SIM Card" is overdue. Tap here to review nearby vendors.',
        type: 'task-reminder' as const,
        readAt: null,
      },
      {
        userId: students[2]._id, // Yuki
        title: 'Orientation Week Commencing Soon',
        message: 'University of Melbourne O-Week schedules are now live in the community events calendar.',
        type: 'event-update' as const,
        readAt: new Date(),
      },
    ];

    const notifications = await Promise.all(
      notificationsData.map((n) => Notification.create(n))
    );
    console.log(`Created ${notifications.length} user notifications.`);

    // -------------------------------------------------------------
    // 11. Create Bookmarks (Students bookmarking guides)
    // -------------------------------------------------------------
    console.log('\nCreating Guide Bookmarks...');
    const bookmarks = await Promise.all([
      Bookmark.create({ userId: students[0]._id, guideId: guides[0]._id }), // Priya - US groceries
      Bookmark.create({ userId: students[0]._id, guideId: guides[2]._id }), // Priya - US banking
      Bookmark.create({ userId: students[1]._id, guideId: guides[1]._id }), // Carlos - UK groceries
      Bookmark.create({ userId: students[1]._id, guideId: guides[3]._id }), // Carlos - UK banking
      Bookmark.create({ userId: students[2]._id, guideId: guides[4]._id }), // Yuki - Australia SIM
      Bookmark.create({ userId: students[2]._id, guideId: guides[8]._id }), // Yuki - Australia Campus
      Bookmark.create({ userId: students[3]._id, guideId: guides[7]._id }), // Ahmed - Canada study permit
      Bookmark.create({ userId: students[3]._id, guideId: guides[10]._id }), // Ahmed - Canada housing
      Bookmark.create({ userId: students[4]._id, guideId: guides[12]._id }), // Sophie - US health insurance
    ]);
    console.log(`Created ${bookmarks.length} guide bookmarks.`);

    console.log('\n========================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log('Summary of Seeded Data:');
    console.log(`  👤 Admin Account:        1 (admin@farfromhome.com / Admin123!)`);
    console.log(`  🎓 Student Accounts:     ${students.length} (Password: Student123!)`);
    console.log(`  📖 Survival Guides:      ${guides.length} (Published & Verified)`);
    console.log(`  📋 Task Templates:       ${templates.length} (Automated Rules)`);
    console.log(`  ✅ Student Tasks:        ${taskCount} (Active, Completed & Overdue)`);
    console.log(`  🤝 Buddy Profiles:       ${buddyProfiles.length} (Approved Mentors)`);
    console.log(`  📩 Buddy Requests:       ${buddyRequests.length} (Pending, Accepted, Rejected)`);
    console.log(`  🎉 Community Events:     ${communityEvents.length} (Upcoming & Completed)`);
    console.log(`  🎟️ Event Registrations:  ${regCount}`);
    console.log(`  🔔 Notifications:        ${notifications.length}`);
    console.log(`  🔖 Guide Bookmarks:      ${bookmarks.length}`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error during seeding process:', error);
    process.exit(1);
  }
}

seed();
