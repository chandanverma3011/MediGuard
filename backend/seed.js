const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Medicine = require('./models/Medicine');
const Batch = require('./models/Batch');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const medicinesData = [
    { name: 'Paracetamol', category: 'Analgesic', manufacturer: 'GSK' },
    { name: 'Ibuprofen', category: 'Analgesic', manufacturer: 'Pfizer' },
    { name: 'Amoxicillin', category: 'Antibiotic', manufacturer: 'Novartis' },
    { name: 'Cetirizine', category: 'Antihistamine', manufacturer: 'Cipla' },
    { name: 'Metformin', category: 'Antidiabetic', manufacturer: 'Sun Pharma' },
    { name: 'Atorvastatin', category: 'Cardiovascular', manufacturer: 'Dr. Reddy\'s' },
    { name: 'Omeprazole', category: 'Gastrointestinal', manufacturer: 'AstraZeneca' },
    { name: 'Amlodipine', category: 'Cardiovascular', manufacturer: 'Lupin' },
    { name: 'Losartan', category: 'Cardiovascular', manufacturer: 'Torrent' },
    { name: 'Azithromycin', category: 'Antibiotic', manufacturer: 'Zydus' },
    { name: 'Ciprofloxacin', category: 'Antibiotic', manufacturer: 'Bayer' },
    { name: 'Pantoprazole', category: 'Gastrointestinal', manufacturer: 'Alkem' },
    { name: 'Montelukast', category: 'Respiratory', manufacturer: 'Merck' },
    { name: 'Levothyroxine', category: 'Endocrine', manufacturer: 'Abbott' },
    { name: 'Clopidogrel', category: 'Cardiovascular', manufacturer: 'Sanofi' },
    { name: 'Rosuvastatin', category: 'Cardiovascular', manufacturer: 'Crestor' },
    { name: 'Esomeprazole', category: 'Gastrointestinal', manufacturer: 'Nexium' },
    { name: 'Sitagliptin', category: 'Antidiabetic', manufacturer: 'Januvia' },
    { name: 'Pregabalin', category: 'Neurological', manufacturer: 'Lyrica' },
    { name: 'Duloxetine', category: 'Neurological', manufacturer: 'Cymbalta' },
    { name: 'Salbutamol', category: 'Respiratory', manufacturer: 'Ventolin' },
    { name: 'Furosemide', category: 'Diuretic', manufacturer: 'Lasix' },
    { name: 'Gabapentin', category: 'Neurological', manufacturer: 'Neurontin' },
    { name: 'Tramadol', category: 'Analgesic', manufacturer: 'Ultram' },
    { name: 'Sertraline', category: 'Psychiatric', manufacturer: 'Zoloft' },
    { name: 'Escitalopram', category: 'Psychiatric', manufacturer: 'Lexapro' },
    { name: 'Tamsulosin', category: 'Urological', manufacturer: 'Flomax' },
    { name: 'Finasteride', category: 'Dermatological', manufacturer: 'Propecia' },
    { name: 'Sildenafil', category: 'Urological', manufacturer: 'Viagra' },
    { name: 'Tadalafil', category: 'Urological', manufacturer: 'Cialis' },
    { name: 'Loratadine', category: 'Antihistamine', manufacturer: 'Claritin' },
    { name: 'Fexofenadine', category: 'Antihistamine', manufacturer: 'Allegra' },
    { name: 'Doxycycline', category: 'Antibiotic', manufacturer: 'Vibramycin' },
    { name: 'Cephalexin', category: 'Antibiotic', manufacturer: 'Keflex' },
    { name: 'Prednisone', category: 'Steroid', manufacturer: 'Deltasone' },
    { name: 'Hydrochlorothiazide', category: 'Diuretic', manufacturer: 'Microzide' },
    { name: 'Lisinopril', category: 'Cardiovascular', manufacturer: 'Zestril' },
    { name: 'Simvastatin', category: 'Cardiovascular', manufacturer: 'Zocor' },
    { name: 'Meloxicam', category: 'Analgesic', manufacturer: 'Mobic' },
    { name: 'Citalopram', category: 'Psychiatric', manufacturer: 'Celexa' },
    { name: 'Trazodone', category: 'Psychiatric', manufacturer: 'Desyrel' },
    { name: 'Venlafaxine', category: 'Psychiatric', manufacturer: 'Effexor' },
    { name: 'Bupropion', category: 'Psychiatric', manufacturer: 'Wellbutrin' },
    { name: 'Fluoxetine', category: 'Psychiatric', manufacturer: 'Prozac' },
    { name: 'Carvedilol', category: 'Cardiovascular', manufacturer: 'Coreg' },
    { name: 'Metoprolol', category: 'Cardiovascular', manufacturer: 'Lopressor' },
    { name: 'Warfarin', category: 'Cardiovascular', manufacturer: 'Coumadin' },
    { name: 'Apixaban', category: 'Cardiovascular', manufacturer: 'Eliquis' },
    { name: 'Rivaroxaban', category: 'Cardiovascular', manufacturer: 'Xarelto' },
    { name: 'Insulin Glargine', category: 'Antidiabetic', manufacturer: 'Lantus' }
];

const generateBatch = (medicineId) => {
    const batchNumber = Math.random().toString(36).substring(2, 8).toUpperCase();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 365 * 2)); // Up to 2 years future

    // Sometimes generate expiring soon or expired data
    if (Math.random() < 0.2) {
        futureDate.setMonth(futureDate.getMonth() - 6); // Expired or expiring
    }

    const stock = Math.floor(Math.random() * 500) + 10;

    let status = 'Ok';
    if (stock < 50) status = 'Low Stock';

    const today = new Date();
    const diffTime = futureDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 90 && diffDays > 0) status = 'Expiring Soon'; // Basic logic, backend might override on fetch

    return {
        batchNumber,
        medicineId,
        expiryDate: futureDate,
        stock,
        status
    };
};

const importData = async () => {
    await connectDB();

    try {
        await Medicine.deleteMany();
        await Batch.deleteMany();
        await User.deleteMany();
        console.log('Data Destroyed...');

        // Create Admin User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password', salt);

        await User.create({
            name: 'Pharmacy Admin',
            email: 'admin@mediguard.com',
            password: hashedPassword,
            role: 'admin',
            isApproved: true
        });
        console.log('Admin User Created');

        // Create Pharmacist User
        await User.create({
            name: 'Test Pharmacist',
            email: 'pharmacist@mediguard.com',
            password: hashedPassword,
            role: 'pharmacist',
            isApproved: true,
            status: 'approved'
        });
        console.log('Pharmacist User Created');

        const createdMedicines = await Medicine.insertMany(medicinesData);
        console.log(`Inserted ${createdMedicines.length} medicines`);

        let batches = [];
        createdMedicines.forEach(med => {
            // Generate 2-3 batches per medicine
            const numBatches = Math.floor(Math.random() * 2) + 2;
            for (let i = 0; i < numBatches; i++) {
                batches.push(generateBatch(med._id));
            }
        });

        await Batch.insertMany(batches);
        console.log(`Inserted ${batches.length} batches`);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
