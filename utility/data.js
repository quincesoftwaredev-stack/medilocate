

const locations = [
  {
    name: "Central Dhaka",
    location: {
      type: "Point",
      coordinates: [90.4125, 23.8103] // [longitude, latitude]
    }
  },
  {
    name: "Gulshan",
    location: {
      type: "Point",
      coordinates: [90.3956, 23.7937]
    }
  },
  {
    name: "Dhanmondi",
    location: {
      type: "Point",
      coordinates: [90.3948, 23.7509]
    }
  },
  {
    name: "Mirpur",
    location: {
      type: "Point",
      coordinates: [90.3548, 23.8103]
    }
  },
  {
    name: "Uttara",
    location: {
      type: "Point",
      coordinates: [90.3935, 23.8608]
    }
  }
];

const users = [
  {
    email: "user1@example.com",
    firstName: "Aminul",
    lastName: "Islam",
    role: "user",
    fee: 500,
    departments: ["Cardiology"],
    location: { type: "Point", coordinates: [23.8200, 90.4150] } // Near Dhaka
  },
  {
    email: "user2@example.com",
    firstName: "Rahman",
    lastName: "Hossain",
    role: "doctor",
    fee: 700,
    departments: ["Dermatology"],
    location: { type: "Point", coordinates: [23.8050, 90.4000] } // Near Dhaka
  },
  {
    email: "user3@example.com",
    firstName: "Sadia",
    lastName: "Karim",
    role: "admin",
    fee: 0,
    departments: ["Administration"],
    location: { type: "Point", coordinates: [23.8150, 90.4200] } // Near Dhaka
  },
  {
    email: "user4@example.com",
    firstName: "Mahbub",
    lastName: "Alam",
    role: "doctor",
    fee: 600,
    departments: ["Neurology"],
    location: { type: "Point", coordinates: [23.8250, 90.4100] } // Near Dhaka
  },
  {
    email: "user5@example.com",
    firstName: "Nasrin",
    lastName: "Jahan",
    role: "user",
    fee: 550,
    departments: ["Orthopedics"],
    location: { type: "Point", coordinates: [23.8180, 90.4050] } // Near Dhaka
  },
  {
    email: "user6@example.com",
    firstName: "Kamrul",
    lastName: "Hasan",
    role: "doctor",
    fee: 800,
    departments: ["Gastroenterology"],
    location: { type: "Point", coordinates: [23.8120, 90.4250] } // Near Dhaka
  },
  {
    email: "user7@example.com",
    firstName: "Mariam",
    lastName: "Akter",
    role: "doctor",
    fee: 750,
    departments: ["Pediatrics"],
    location: { type: "Point", coordinates: [23.8190, 90.4070] } // Near Dhaka
  },
  {
    email: "user8@example.com",
    firstName: "Jamil",
    lastName: "Ahmed",
    role: "user",
    fee: 450,
    departments: ["ENT"],
    location: { type: "Point", coordinates: [23.8135, 90.4185] } // Near Dhaka
  },
  {
    email: "user9@example.com",
    firstName: "Fahim",
    lastName: "Uddin",
    role: "doctor",
    fee: 720,
    departments: ["Ophthalmology"],
    location: { type: "Point", coordinates: [23.8070, 90.4160] } // Near Dhaka
  },
  {
    email: "user10@example.com",
    firstName: "Tasnim",
    lastName: "Chowdhury",
    role: "user",
    fee: 500,
    departments: ["Gynecology"],
    location: { type: "Point", coordinates: [23.8215, 90.4080] } // Near Dhaka
  }
];


const termsAndConditions = [
  {
    section: 1,
    title: 'General Terms',
    content:
      'By accessing and using mediLocate.health, you agree to comply with these Terms and Conditions. mediLocate.health is a platform that connects patients with licensed doctors for home visit appointments. We may update these terms at any time, and continued use of our services indicates your acceptance of any changes.'
  },
  {
    section: 2,
    title: 'Service Description',
    content:
      'mediLocate.health facilitates communication between patients and doctors. Appointment time, location, and consultation details are agreed upon directly between the patient and the doctor through the platform. mediLocate.health does not guarantee instant availability of doctors.'
  },
  {
    section: 3,
    title: 'Medical Disclaimer',
    content:
      'mediLocate.health does not provide medical advice, diagnosis, or treatment. All medical services are provided independently by licensed doctors. Patients are responsible for discussing their conditions directly with the doctor and making informed decisions.'
  },
  {
    section: 4,
    title: 'User Accounts',
    content:
      'You may need to create an account to use certain features. You are responsible for maintaining the confidentiality of your account credentials. mediLocate.health reserves the right to suspend or terminate accounts that violate our policies.'
  },
  {
    section: 5,
    title: 'Appointments & Responsibilities',
    content:
      'Patients and doctors are responsible for agreeing on a suitable time and location for home visits. Users must provide accurate information. mediLocate.health is not responsible for missed appointments, delays, or cancellations made by either party.'
  },
  {
    section: 6,
    title: 'Payments',
    content:
      'Payments for doctor services may be processed through the platform or handled directly between patient and doctor, depending on the service type. Users agree to provide accurate billing information. Refunds, if applicable, depend on individual cases and policies.'
  },
  {
    section: 7,
    title: 'Privacy and Data Protection',
    content:
      'We value your privacy. Personal data is collected and used in accordance with our Privacy Policy. By using mediLocate.health, you consent to the collection and use of your information for service delivery.'
  },
  {
    section: 8,
    title: 'Prohibited Activities',
    content:
      'Users must not engage in fraudulent activities, impersonation, harassment, or misuse of the platform. Any attempt to exploit doctors or patients, or to bypass the system unfairly, may result in account suspension.'
  },
  {
    section: 9,
    title: 'Third-Party Responsibility',
    content:
      'Doctors on mediLocate.health are independent professionals. mediLocate.health does not control or guarantee the quality, outcome, or effectiveness of medical services provided.'
  },
  {
    section: 10,
    title: 'Limitation of Liability',
    content:
      'mediLocate.health is not liable for any direct or indirect damages, including medical outcomes, delays, or disputes between users. The platform is provided on an "as is" basis without warranties.'
  },
  {
    section: 11,
    title: 'Contact Us',
    content:
      'For any questions regarding these Terms and Conditions, please contact us at support@medilocate.health.'
  }
];
const privacyPolicy = [
  {
    section: 1,
    title: 'Introduction',
    content:
      'mediLocate.health is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform to connect with doctors for home visits.'
  },
  {
    section: 2,
    title: 'Information We Collect',
    content:
      'We collect personal information such as your name, phone number, email, location, and basic health-related details required to connect you with doctors. We may also collect device and usage data to improve our services.'
  },
  {
    section: 3,
    title: 'How We Use Your Information',
    content:
      'Your data is used to connect you with doctors, facilitate appointment scheduling, enable communication, process payments, and improve user experience. We may also send notifications related to your bookings.'
  },
  {
    section: 4,
    title: 'Sharing of Information',
    content:
      'Your information may be shared with doctors to facilitate consultations and home visits. We do not sell your personal data. Data may also be shared with trusted service providers such as payment processors or when required by law.'
  },
  {
    section: 5,
    title: 'Doctor-Patient Communication',
    content:
      'Information shared during chat or communication with doctors may be stored to improve service quality and resolve disputes. However, sensitive medical discussions remain private between patient and doctor.'
  },
  {
    section: 6,
    title: 'Data Security',
    content:
      'We implement appropriate security measures to protect your data. However, no system is completely secure, and users should take precautions when sharing sensitive information.'
  },
  {
    section: 7,
    title: 'Cookies and Tracking',
    content:
      'We use cookies and similar technologies to enhance user experience, analyze usage, and personalize content. You can control cookies through your browser settings.'
  },
  {
    section: 8,
    title: 'User Rights',
    content:
      'You have the right to access, update, or request deletion of your personal data. You may also opt out of non-essential communications.'
  },
  {
    section: 9,
    title: 'Data Retention',
    content:
      'We retain your information only as long as necessary to provide services and comply with legal obligations. Afterward, data is securely deleted or anonymized.'
  },
  {
    section: 10,
    title: 'Children’s Privacy',
    content:
      'mediLocate.health does not knowingly collect data from individuals under 18. If such data is identified, it will be removed promptly.'
  },
  {
    section: 11,
    title: 'Updates to Policy',
    content:
      'We may update this Privacy Policy from time to time. Changes will be posted on this page, and continued use of the platform indicates acceptance.'
  },
  {
    section: 12,
    title: 'Contact Us',
    content:
      'If you have any questions about this Privacy Policy, contact us at privacy@medilocate.health.'
  }
];

export default users;









export { termsAndConditions, privacyPolicy, users }
