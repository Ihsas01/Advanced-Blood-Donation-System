import Donor from '../models/donor.model.js';
import Hospital from '../models/hospital.model.js';
import BloodDonationAppointment from '../models/BloodDonationAppointment.model.js';
import BloodInventory from '../models/BloodInventory.model.js';
import EmergencyBR from '../models/EmergencyBR.model.js';
import HospitalAdmin from '../models/HospitalAdmin.model.js';
import SystemManager from '../models/SystemManager.model.js';
import Inquiry from '../models/inquiry.model.js';

export const getDonorData = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const donor = await Donor.findById(userId).select('bloodType healthStatus');
    const appointments = await BloodDonationAppointment.find({
      donorId: userId,
      progressStatus: { $ne: 'Cancelled' },
    }).sort({ appointmentDate: -1 });

    const totalDonations = await BloodDonationAppointment.countDocuments({
      donorId: userId,
      progressStatus: 'Completed',
    });

    const nextAppointment = appointments.find(
      (appt) => new Date(appt.appointmentDate) >= new Date()
    );

    res.json({
      bloodType: donor?.bloodType || 'N/A',
      healthStatus: donor?.healthStatus || false,
      totalDonations,
      nextAppointment: nextAppointment
        ? { date: nextAppointment.appointmentDate, time: nextAppointment.appointmentTime }
        : null,
      donationHistory: appointments.map((appt) => ({
        date: appt.appointmentDate,
        hospitalId: appt.hospitalId,
        status: appt.progressStatus,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getHospitalData = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const hospital = await Hospital.findById(userId).select('name');
    const bloodStock = await BloodInventory.find({
      hospitalId: userId,
      expiredStatus: false,
    });
    const totalStock = bloodStock.reduce((sum, stock) => sum + stock.availableStocks, 0);
    const activeDonors = await BloodDonationAppointment.distinct('donorId', {
      hospitalId: userId,
      progressStatus: 'Completed',
      appointmentDate: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
    }).then((donors) => donors.length);
    const pendingRequests = await EmergencyBR.countDocuments({
      hospitalName: hospital?.name || '',
      acceptStatus: 'Pending',
    });

    res.json({
      totalStock,
      activeDonors,
      pendingRequests,
      bloodStock: bloodStock.map((stock) => ({
        bloodType: stock.bloodType,
        units: stock.availableStocks,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getManagerData = async (req, res) => {
  try {
    const totalUsers = (await Donor.countDocuments()) +
                       (await Hospital.countDocuments()) +
                       (await HospitalAdmin.countDocuments());
    const hospitals = await Hospital.countDocuments();
    const inactiveAccounts = (await Donor.countDocuments({ activeStatus: false })) +
                             (await Hospital.countDocuments({ activeStatus: false })) +
                             (await HospitalAdmin.countDocuments({ activeStatus: false }));
    const pendingInquiries = await Inquiry.countDocuments({ attentiveStatus: 'Pending' });

    res.json({
      totalUsers,
      hospitals,
      inactiveAccounts,
      pendingInquiries,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};