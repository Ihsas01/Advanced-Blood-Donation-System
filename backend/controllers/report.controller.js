import BloodInventory from '../models/BloodInventory.model.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import HealthEvaluation from '../models/HealthEvaluation.model.js';
import Feedback from '../models/feedback.model.js';
import Inquiry from '../models/inquiry.model.js';
import Appointment from '../models/BloodDonationAppointment.model.js';
import SystemManager from '../models/SystemManager.model.js';
import Donor from '../models/donor.model.js';
import Hospital from '../models/hospital.model.js';
import EmergencyBR from '../models/EmergencyBR.model.js'; // Adjust the path to your model
import HospitalAdmin from '../models/HospitalAdmin.model.js';
import moment from 'moment';

export const generateHealthEvaluationReport = async (req, res) => {
  try {
    const { userId } = req.query;

    const evaluations = await HealthEvaluation.find({ donorId: userId })
      .populate('donorId', 'firstName lastName email')
      .sort({ evaluationDate: -1 });

    if (!evaluations.length) {
      return res.status(404).json({ success: false, message: 'No evaluations found for this donor' });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const fileName = `health_evaluation_report_${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = `./reports/${fileName}`;

    if (!fs.existsSync('./reports')) {
      fs.mkdirSync('./reports');
    }

    doc.pipe(fs.createWriteStream(filePath));

    // Optional logo
    const logoPath = '../../frontend/src/assets/logo.svg';
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 30, { width: 80 });
    }

    const donorName = `${evaluations[0]?.donorId?.firstName || ''} ${evaluations[0]?.donorId?.lastName || ''}`;
    const donorEmail = evaluations[0]?.donorId?.email || '';

    // Title
    doc
      .fontSize(18)
      .fillColor('#FF2400')
      .text('Health Evaluation Report', { align: 'center' });

    doc
      .moveDown(0.3)
      .fontSize(12)
      .fillColor('#333')
      .text(`Donor: ${donorName}`, { align: 'center' });

    doc
      .fontSize(10)
      .fillColor('#666')
      .text(`Email: ${donorEmail}`, { align: 'center' });

    doc
      .fontSize(10)
      .text(`Generated on: ${new Date().toDateString()}`, { align: 'center' });

    doc.moveDown(1);

    // Table layout
    const tableTop = 160;
    const rowHeight = 25;
    const colWidths = [25, 90, 70, 50, 45, 80, 60, 65];
    const startX = 40;

    const headers = ['No', 'Donor', 'Date', 'Time', 'Pass', 'Progress', 'Active', 'Feedback'];

    let y = tableTop;

    const totalWidth = colWidths.reduce((a, b) => a + b, 0);

    // Table header row
    doc.rect(startX, y, totalWidth, rowHeight).fill('#FF9280').stroke();
    doc.font('Helvetica-Bold').fillColor('#fff').fontSize(10);

    let x = startX;
    headers.forEach((header, i) => {
      doc.text(header, x + 5, y + 7, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });

    y += rowHeight;

    // Table rows
    doc.font('Helvetica').fontSize(9);

    evaluations.forEach((item, index) => {
      const bgColor = index % 2 === 0 ? '#ffffff' : '#f6f6f6';
      doc.rect(startX, y, totalWidth, rowHeight).fill(bgColor).stroke();

      const donor = `${item.donorId?.firstName || ''} ${item.donorId?.lastName || ''}`;
      const row = [
        index + 1,
        donor,
        item.evaluationDate?.toDateString() || 'N/A',
        item.evaluationTime || 'N/A',
        item.passStatus || 'N/A',
        item.progressStatus || 'N/A',
        item.activeStatus || 'N/A',
        item.feedbackStatus ? 'Yes' : 'No',
      ];

      x = startX;
      row.forEach((data, i) => {
        doc.fillColor('#000').text(data, x + 5, y + 6, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      y += rowHeight;

      // Page break
      if (y + rowHeight > doc.page.height - 40) {
        doc.addPage();
        y = 60;

        // Redraw table header on new page
        doc.rect(startX, y, totalWidth, rowHeight).fill('#FF9280').stroke();
        doc.font('Helvetica-Bold').fillColor('#fff').fontSize(10);
        x = startX;
        headers.forEach((header, i) => {
          doc.text(header, x + 5, y + 7, { width: colWidths[i], align: 'left' });
          x += colWidths[i];
        });

        y += rowHeight;
        doc.font('Helvetica').fillColor('#000').fontSize(9);
      }
    });

    doc.end();

    res.json({ success: true, fileUrl: `/reports/${fileName}` });
  } catch (error) {
    console.error('Error generating health evaluation report:', error);
    res.status(500).json({ success: false, message: 'Error generating report' });
  }
};


export const generateHealthEvaluationReportByHospital = async (req, res) => {
  try {
    const { userId } = req.query;

    const evaluations = await HealthEvaluation.find({ hospitalId: userId })
      .populate('hospitalId', 'name')
      .populate('donorId', 'firstName lastName')
      .sort({ evaluationDate: -1 });

    if (!evaluations.length) {
      return res.status(404).json({ success: false, message: 'No evaluations found for this hospital' });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const fileName = `health_evaluation_report_${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = `./reports/${fileName}`;

    if (!fs.existsSync('./reports')) {
      fs.mkdirSync('./reports');
    }

    doc.pipe(fs.createWriteStream(filePath));

    const hospitalName = evaluations[0]?.hospitalId?.name || 'Hospital';

    // Add logo (optional)
    const logoPath = './assets/logo.svg'; // Adjust as per actual backend path
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, 40, 30, { width: 60 });
      } catch (err) {
        console.warn('Logo failed to load:', err.message);
      }
    }

    // Report Title
    doc.fontSize(18).fillColor('#FF2400').text('Health Evaluation Report', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(12).fillColor('#333').text(`Hospital: ${hospitalName}`, { align: 'center' });
    doc.fontSize(10).fillColor('#666').text(`Generated: ${new Date().toDateString()}`, { align: 'center' });

    doc.moveDown(1);

    // Table setup
    const tableTop = 160;
    const rowHeight = 25;
    const colWidths = [30, 90, 70, 50, 45, 70, 55, 65];
    const startX = 40;

    const headers = ['#', 'Donor', 'Date', 'Time', 'Pass', 'Progress', 'Active', 'Feedback'];

    let y = tableTop;

    const drawHeader = () => {
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), rowHeight).fill('#FF9280').stroke();
      doc.font('Helvetica-Bold').fillColor('#fff').fontSize(10);
      let x = startX;
      headers.forEach((header, i) => {
        doc.text(header, x + 5, y + 7, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      y += rowHeight;
    };

    drawHeader();

    // Initialize counters for summary
    let passCount = 0, activeCount = 0, feedbackCount = 0;

    evaluations.forEach((item, index) => {
      if (y + rowHeight > doc.page.height - 60) {
        doc.addPage();
        y = 50;
        drawHeader();
      }

      const donorName = `${item.donorId?.firstName || ''} ${item.donorId?.lastName || ''}`.trim();
      const row = [
        index + 1,
        donorName || 'N/A',
        item.evaluationDate?.toDateString() || 'N/A',
        item.evaluationTime || 'N/A',
        item.passStatus,
        item.progressStatus,
        item.activeStatus,
        item.feedbackStatus ? 'Yes' : 'No',
      ];

      if (item.passStatus === 'Pass') passCount++;
      if (item.activeStatus === 'Active') activeCount++;
      if (item.feedbackStatus) feedbackCount++;

      const bgColor = index % 2 === 0 ? '#fff' : '#f7f7f7';
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor).stroke();

      let x = startX;
      row.forEach((data, i) => {
        doc.fillColor('#000').font('Helvetica').fontSize(9).text(data, x + 5, y + 6, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      y += rowHeight;
    });

    // Summary
    if (y + 80 > doc.page.height - 40) {
      doc.addPage();
      y = 60;
    }

    doc.moveTo(startX, y + 10).lineTo(startX + 500, y + 10).stroke();

    doc.fontSize(12).fillColor('#FF2400').text('Summary', startX, y + 20);

    doc.fontSize(10).fillColor('#333').text(`Total Evaluations: ${evaluations.length}`, startX, y + 40);
    doc.text(`Passed: ${passCount}`, startX, y + 55);
    doc.text(`Active Donors: ${activeCount}`, startX, y + 70);
    doc.text(`With Feedback: ${feedbackCount}`, startX, y + 85);

    doc.end();

    res.json({ success: true, fileUrl: `/reports/${fileName}` });
  } catch (error) {
    console.error('Error generating health evaluation report:', error);
    res.status(500).json({ success: false, message: 'Error generating report' });
  }
};


export const generateInventoryReport = async (req, res) => {
  try {
    const { userId } = req.query;

    // Update expired flags first
    await BloodInventory.updateExpiredStatus();

    const inventoryItems = await BloodInventory.find({ hospitalId: userId })
      .populate('hospitalId', 'name')
      .select('bloodType availableStocks expirationDate expiredStatus createdAt updatedAt');

    if (!inventoryItems.length) {
      return res.status(404).json({ success: false, message: 'No inventory found for this hospital' });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const fileName = `inventory_report_${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = `./reports/${fileName}`;

    if (!fs.existsSync('./reports')) {
      fs.mkdirSync('./reports');
    }

    doc.pipe(fs.createWriteStream(filePath));

    const hospitalName = inventoryItems[0]?.hospitalId?.name || 'Hospital';

    // Title section
    doc
      .fontSize(18)
      .fillColor('#FF2400')
      .text('Blood Inventory Report', { align: 'center' });

    doc
      .moveDown(0.5)
      .fontSize(12)
      .fillColor('#000')
      .text(`Hospital: ${hospitalName}`, { align: 'center' });

    doc
      .fontSize(10)
      .fillColor('#666')
      .text(`Generated: ${new Date().toDateString()}`, { align: 'center' });

    doc.moveDown();

    // Table headers
    const tableTop = 150;
    const rowHeight = 25;
    const colWidths = [50, 80, 80, 90, 60, 90, 90];
    const headers = ['#', 'Blood Type', 'Stocks', 'Expiration', 'Expired', 'Created', 'Updated'];
    let startX = 40;
    let y = tableTop;

    const renderTableHeader = () => {
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), rowHeight).fill('#FF9280').stroke();
      doc.font('Helvetica-Bold').fillColor('#fff').fontSize(10);
      let x = startX;
      headers.forEach((header, i) => {
        doc.text(header, x + 5, y + 7, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      y += rowHeight;
    };

    renderTableHeader();

    // Data rows
    doc.font('Helvetica').fillColor('#000').fontSize(9);

    let expiredCount = 0;

    inventoryItems.forEach((item, index) => {
      let x = startX;

      if (y + rowHeight > doc.page.height - 50) {
        doc.addPage();
        y = 50;
        renderTableHeader();
      }

      const bgColor = index % 2 === 0 ? '#ffffff' : '#f7f7f7';
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor).stroke();

      const row = [
        index + 1,
        item.bloodType,
        item.availableStocks,
        item.expirationDate ? item.expirationDate.toDateString() : 'N/A',
        item.expiredStatus ? 'Yes' : 'No',
        item.createdAt ? item.createdAt.toDateString() : 'N/A',
        item.updatedAt ? item.updatedAt.toDateString() : 'N/A',
      ];

      if (item.expiredStatus) expiredCount++;

      row.forEach((data, i) => {
        doc.fillColor('#000').text(data, x + 5, y + 6, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      y += rowHeight;
    });

    // Summary
    if (y + 70 > doc.page.height - 40) {
      doc.addPage();
      y = 60;
    }

    doc.moveTo(startX, y + 10).lineTo(startX + 500, y + 10).stroke();

    doc
      .fontSize(12)
      .fillColor('#FF2400')
      .text('Summary', startX, y + 20);

    doc
      .fontSize(10)
      .fillColor('#333')
      .text(`Total Blood Types Listed: ${inventoryItems.length}`, startX, y + 40);

    doc
      .text(`Expired Entries: ${expiredCount}`, startX, y + 60);

    doc.end();

    res.json({ success: true, fileUrl: `/reports/${fileName}` });
  } catch (error) {
    console.error('Error generating inventory report:', error);
    res.status(500).json({ success: false, message: 'Error generating report' });
  }
};
export const generateInventoryReportByManager = async (req, res) => {
  try {
    // Update expired flags for all inventory items
    await BloodInventory.updateExpiredStatus();

    // Fetch all inventory items, populating hospital names
    const inventoryItems = await BloodInventory.find()
      .populate('hospitalId', 'name')
      .select('bloodType availableStocks expirationDate expiredStatus createdAt updatedAt hospitalId')
      .sort({ 'hospitalId.name': 1, bloodType: 1 }); // Sort by hospital name, then blood type

    if (!inventoryItems.length) {
      return res.status(404).json({ success: false, message: 'No inventory found in the system' });
    }

    // Initialize PDF document
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const fileName = `system_inventory_report_${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = `./reports/${fileName}`;

    // Create reports directory if it doesn't exist
    if (!fs.existsSync('./reports')) {
      fs.mkdirSync('./reports');
    }

    doc.pipe(fs.createWriteStream(filePath));

    // Title section
    doc
      .fontSize(18)
      .fillColor('#FF2400')
      .text('System-Wide Blood Inventory Report', { align: 'center' });

    doc
      .moveDown(0.5)
      .fontSize(12)
      .fillColor('#000')
      .text('All Hospitals', { align: 'center' });

    doc
      .fontSize(10)
      .fillColor('#666')
      .text(`Generated: ${new Date().toDateString()}`, { align: 'center' });

    doc.moveDown();

    // Table headers
    const tableTop = 150;
    const rowHeight = 25;
    const colWidths = [20, 120, 70, 70, 90, 60, 90]; // Adjusted for hospital column
    const headers = ['#', 'Hospital', 'Blood Type', 'Stocks', 'Expiration', 'Expired', 'Created'];
    let startX = 40;
    let y = tableTop;

    const renderTableHeader = () => {
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), rowHeight).fill('#FF9280').stroke();
      doc.font('Helvetica-Bold').fillColor('#fff').fontSize(10);
      let x = startX;
      headers.forEach((header, i) => {
        doc.text(header, x + 5, y + 7, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      y += rowHeight;
    };

    renderTableHeader();

    // Data rows
    doc.font('Helvetica').fillColor('#000').fontSize(9);

    let expiredCount = 0;
    let currentHospitalId = null;
    let index = 0;

    inventoryItems.forEach((item) => {
      let x = startX;

      // Handle page overflow
      if (y + rowHeight > doc.page.height - 50) {
        doc.addPage();
        doc.font('Helvetica').fillColor('#000').fontSize(9);
        y = 50;
        renderTableHeader();
        
      }

      // Add hospital separator if new hospital
      if (item.hospitalId?._id.toString() !== currentHospitalId) {
        currentHospitalId = item.hospitalId?._id.toString();
        if (index > 0) {
          y += 10; // Space before new hospital section
          if (y + rowHeight > doc.page.height - 50) {
            doc.addPage();
            y = 50;
            renderTableHeader();
          }
        }
      }

      const bgColor = index % 2 === 0 ? '#ffffff' : '#f7f7f7';
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor).stroke();

      const row = [
        index + 1,
        item.hospitalId?.name || 'Unknown Hospital',
        item.bloodType,
        item.availableStocks,
        item.expirationDate ? item.expirationDate.toDateString() : 'N/A',
        item.expiredStatus ? 'Yes' : 'No',
        item.createdAt ? item.createdAt.toDateString() : 'N/A',
      ];

      if (item.expiredStatus) expiredCount++;

      row.forEach((data, i) => {
        doc.fillColor('#000').text(data, x + 5, y + 6, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      y += rowHeight;
      index++;
    });

    // Summary
    if (y + 70 > doc.page.height - 40) {
      doc.addPage();
      y = 60;
    }

    doc.moveTo(startX, y + 10).lineTo(startX + 500, y + 10).stroke();

    doc
      .fontSize(12)
      .fillColor('#FF2400')
      .text('Summary', startX, y + 20);

    doc
      .fontSize(10)
      .fillColor('#333')
      .text(`Total Inventory Entries: ${inventoryItems.length}`, startX, y + 40);

    doc
      .text(`Expired Entries: ${expiredCount}`, startX, y + 60);

    // Add unique hospitals count
    const uniqueHospitals = [...new Set(inventoryItems.map(item => item.hospitalId?._id?.toString()))].length;
    doc
      .text(`Hospitals Included: ${uniqueHospitals}`, startX, y + 80);

    doc.end();

    res.json({ success: true, fileUrl: `/reports/${fileName}` });
  } catch (error) {
    console.error('Error generating system inventory report:', error);
    res.status(500).json({ success: false, message: 'Error generating report' });
  }
};


export const generateFeedbackReport = async (req, res) => {
  try {
    const feedbackItems = await Feedback.find()
      .select('subject comments feedbackType starRating sessionModel createdAt')
      .sort({ createdAt: -1 });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const fileName = `feedback_report_${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = `./reports/${fileName}`;

    if (!fs.existsSync('./reports')) {
      fs.mkdirSync('./reports');
    }

    doc.pipe(fs.createWriteStream(filePath));

    const logoPath = '../../frontend/src/assets/logo.svg';

    const generateHeader = () => {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 30, { width: 60 });
      }
      doc
        .fontSize(20)
        .fillColor('#FF2400')
        .text('User Feedback Summary', 0, 40, { align: 'center' });

      doc
        .moveDown()
        .fontSize(11)
        .fillColor('#555')
        .text(`Generated on: ${new Date().toDateString()}`, { align: 'right' });
    };

    const generateTableHeader = (y) => {
      const headers = ['#', 'Subject', 'Comments', 'Type', 'Rate', 'Session', 'Date'];
      const colWidths = [30, 100, 160, 70, 40, 60, 70];
      const startX = 40;

      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), 25)
        .fill('#FF9280')
        .stroke();

      doc.font('Helvetica-Bold').fillColor('#fff').fontSize(10);
      let x = startX;
      headers.forEach((header, i) => {
        doc.text(header, x + 4, y + 7, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      return y + 25;
    };

    const colWidths = [30, 100, 160, 70, 40, 60, 70];
    const startX = 40;
    const rowHeight = 60;
    const pageHeight = doc.page.height - 40; // account for bottom margin

    generateHeader();
    let y = 120;
    y = generateTableHeader(y);

    doc.font('Helvetica').fontSize(9);

    feedbackItems.forEach((item, index) => {
      // If exceeding page, add new page
      if (y + rowHeight > pageHeight) {
        doc.addPage();
        generateHeader();
         y = 120;
        y = generateTableHeader(y);
        doc.font('Helvetica').fontSize(9);
      }

      const row = [
        index + 1,
        item.subject || 'N/A',
        item.comments ? item.comments.slice(0, 100) + (item.comments.length > 100 ? '...' : '') : 'N/A',
        item.feedbackType || 'N/A',
        item.starRating || '-',
        item.sessionModel || 'N/A',
        item.createdAt ? item.createdAt.toDateString() : 'N/A',
      ];

      const bgColor = index % 2 === 0 ? '#fefefe' : '#f7f7f7';
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor).stroke();

      let x = startX;
      row.forEach((data, i) => {
        doc.fillColor('#000').text(data, x + 4, y + 6, {
          width: colWidths[i] - 8,
          align: 'left',
          height: rowHeight - 10,
        });
        x += colWidths[i];
      });

      y += rowHeight;
    });

    doc.end();
    res.json({ success: true, fileUrl: `/reports/${fileName}` });
  } catch (error) {
    console.error('Error generating feedback report:', error);
    res.status(500).json({ success: false, message: 'Error generating report' });
  }
};



export const generateInquiryReport = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .select('email subject message category attentiveStatus createdAt')
      .sort({ createdAt: -1 });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const fileName = `inquiry_report_${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = `./reports/${fileName}`;

    if (!fs.existsSync('./reports')) {
      fs.mkdirSync('./reports');
    }

    doc.pipe(fs.createWriteStream(filePath));

    const logoPath = '../../frontend/src/assets/logo.svg';

    const generateHeader = () => {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 30, { width: 60 });
      }
      doc
        .fontSize(20)
        .fillColor('#FF2400')
        .text('User Inquiry Summary', 0, 40, { align: 'center' });

      doc
        .moveDown()
        .fontSize(11)
        .fillColor('#555')
        .text(`Generated on: ${new Date().toDateString()}`, { align: 'right' });
    };

    const generateTableHeader = (y) => {
      const headers = ['#', 'Email', 'Subject', 'Message', 'Category', 'Status', 'Date'];
      const colWidths = [25, 100, 90, 130, 70, 60, 60];
      const startX = 40;

      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), 25)
        .fill('#FF9280')
        .stroke();

      doc.font('Helvetica-Bold').fillColor('#fff').fontSize(10);
      let x = startX;
      headers.forEach((header, i) => {
        doc.text(header, x + 4, y + 7, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      return y + 25;
    };

    const colWidths = [25, 100, 90, 130, 70, 60, 60];
    const startX = 40;
    const rowHeight = 50;
    const pageHeight = doc.page.height - 40;

    generateHeader();
    let y = 120;
    y = generateTableHeader(y);

    doc.font('Helvetica').fontSize(9);

    inquiries.forEach((item, index) => {
      if (y + rowHeight > pageHeight) {
        doc.addPage();
        generateHeader();
        y = 120;
        y = generateTableHeader(y);

        doc.font('Helvetica').fontSize(9);
      }

      const row = [
        index + 1,
        item.email || 'N/A',
        item.subject || 'N/A',
        item.message ? item.message.slice(0, 100) + (item.message.length > 100 ? '...' : '') : 'N/A',
        item.category || 'N/A',
        item.attentiveStatus || 'N/A',
        item.createdAt ? item.createdAt.toDateString() : 'N/A',
      ];

      const bgColor = index % 2 === 0 ? '#ffffff' : '#f6f6f6';
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor).stroke();

      let x = startX;
      row.forEach((data, i) => {
        doc.fillColor('#000').text(data, x + 4, y + 6, {
          width: colWidths[i] - 8,
          align: 'left',
          height: rowHeight - 10,
        });
        x += colWidths[i];
      });

      y += rowHeight;
    });

    doc.end();
    res.json({ success: true, fileUrl: `/reports/${fileName}` });
  } catch (error) {
    console.error('Error generating inquiry report:', error);
    res.status(500).json({ success: false, message: 'Error generating report' });
  }
};


export const generateAppointmentReport = async (req, res) => {
  try {
    const { userId } = req.query;

    const appointments = await Appointment.find({ hospitalId: userId })
      .populate('donorId', 'firstName lastName email')
      .populate('hospitalId', 'name')
      .sort({ appointmentDate: -1 });

    if (!appointments.length) {
      return res.status(404).json({ success: false, message: 'No appointments found for this hospital' });
    }

    const hospitalName = appointments[0]?.hospitalId?.name || 'Hospital';

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const fileName = `appointment_report_${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = `./reports/${fileName}`;

    if (!fs.existsSync('./reports')) {
      fs.mkdirSync('./reports');
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const logoPath = '../../frontend/src/assets/logo.svg';

    const colWidths = [25, 90, 80, 60, 45, 60, 45, 60];
    const rowHeight = 25;
    const startX = 40;
    const pageHeight = doc.page.height - 60;

    let page = 1;

    const renderHeader = () => {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 30, { width: 60 });
      }
      doc.fontSize(16).fillColor('#FF2400').text(`${hospitalName} - Appointment Report`, 0, 40, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).fillColor('#666').text(`Generated on: ${new Date().toDateString()}`, { align: 'right' });
    };

    const renderFooter = () => {
      doc.fontSize(9).fillColor('#999').text(`Page ${page}`, 0, doc.page.height - 30, {
        align: 'center',
      });
      page++;
    };

    const renderTableHeader = (y) => {
      const headers = ['#', 'Donor', 'Hospital', 'Date', 'Time', 'Progress', 'Active', 'Feedback'];
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), rowHeight).fill('#FF9280').stroke();
      doc.font('Helvetica-Bold').fillColor('#fff').fontSize(10);

      let x = startX;
      headers.forEach((header, i) => {
        doc.text(header, x + 3, y + 7, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      return y + rowHeight;
    };

    renderHeader();
    let y = 130;
    y = renderTableHeader(y);
    doc.font('Helvetica').fontSize(9);

    // Summary trackers
    let total = 0;
    let active = 0;
    let feedbackGiven = 0;

    appointments.forEach((item, index) => {
      if (y + rowHeight > pageHeight) {
        renderFooter();
        doc.addPage();
        renderHeader();
        y = 130;
        y = renderTableHeader(y);
      }

      total++;
      if (item.activeStatus) active++;
      if (item.feedbackStatus) feedbackGiven++;

      const donorName = `${item.donorId?.firstName || ''} ${item.donorId?.lastName || ''}`.trim() || 'N/A';
      const formattedDate = item.appointmentDate
        ? new Date(item.appointmentDate).toLocaleDateString()
        : 'N/A';

      const row = [
        index + 1,
        donorName,
        item.hospitalId?.name || 'N/A',
        formattedDate,
        item.appointmentTime || 'N/A',
        item.progressStatus || 'Pending',
        item.activeStatus ? 'Yes' : 'No',
        item.feedbackStatus ? 'Yes' : 'No',
      ];

      const bgColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor).stroke();

      let x = startX;
      row.forEach((data, i) => {
        doc.fillColor('#000').text(data, x + 3, y + 6, {
          width: colWidths[i] - 6,
          align: 'left',
        });
        x += colWidths[i];
      });

      y += rowHeight;
    });

    // Summary Section
    if (y + 80 > pageHeight) {
      renderFooter();
      doc.addPage();
      renderHeader();
      y = 130;
    }

    doc.moveTo(40, y + 15).lineTo(555, y + 15).stroke();
    doc.fontSize(12).fillColor('#000').text('Summary', 40, y + 25);
    doc.fontSize(10).fillColor('#333');
    doc.text(`Total Appointments: ${total}`, 40, y + 45);
    doc.text(`Active Appointments: ${active}`, 40, y + 65);
    doc.text(`Feedback Given: ${feedbackGiven}`, 40, y + 85);

    renderFooter();
    doc.end();

    stream.on('finish', () => {
      res.json({ success: true, fileUrl: `/reports/${fileName}` });
    });

  } catch (error) {
    console.error('Error generating appointment report:', error);
    res.status(500).json({ success: false, message: 'Error generating report' });
  }
};


export const generateSystemAdminReport = async (req, res) => {
  try {
    const managers = await SystemManager.find({})
      .select('firstName lastName email phoneNumber nic address dob role activeStatus')
      .sort({ createdAt: -1 });

    if (!managers.length) {
      return res.status(404).json({ success: false, message: 'No system managers found' });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const fileName = `system_admin_report_${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = `./reports/${fileName}`;

    if (!fs.existsSync('./reports')) {
      fs.mkdirSync('./reports');
    }

    doc.pipe(fs.createWriteStream(filePath));

    const logoPath = '../../frontend/src/assets/logo.svg';

    const generateHeader = () => {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 30, { width: 60 });
      }
      doc.fontSize(18).fillColor('#FF2400').text('System Admin Report', 0, 40, { align: 'center' });
      doc.moveDown();
      doc.fontSize(11).fillColor('#555')
        .text(`Generated on: ${new Date().toDateString()}`, { align: 'right' });
    };

    const generateTableHeader = (y) => {
      const headers = ['#', 'Name', 'Email', 'Phone', 'NIC', 'Address', 'DOB', 'Role', 'Active'];
      const colWidths = [20, 70, 100, 60, 70, 90, 60, 40, 40];
      const startX = 40;

      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), 25).fill('#FF9280').stroke();
      doc.font('Helvetica-Bold').fillColor('#fff').fontSize(10);

      let x = startX;
      headers.forEach((header, i) => {
        doc.text(header, x + 3, y + 7, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      return y + 25;
    };

    const colWidths = [20, 70, 100, 60, 70, 90, 60, 40, 40];
    const startX = 40;
    const rowHeight = 35;
    const pageHeight = doc.page.height - 60;

    generateHeader();
    let y = 130;
    y = generateTableHeader(y);

    doc.font('Helvetica').fontSize(9);

    managers.forEach((item, index) => {
      if (y + rowHeight > pageHeight) {
        doc.addPage();
        generateHeader();
        y = 130;
        y = generateTableHeader(y);

        doc.font('Helvetica').fontSize(9);
      }

      const managerName = `${item.firstName} ${item.lastName}`;
      const row = [
        index + 1,
        managerName,
        item.email || 'N/A',
        item.phoneNumber || 'N/A',
        item.nic || 'N/A',
        item.address || 'N/A',
        item.dob ? item.dob.toDateString() : 'N/A',
        item.role || 'N/A',
        item.activeStatus ? 'Yes' : 'No',
      ];

      const bgColor = index % 2 === 0 ? '#ffffff' : '#f6f6f6';
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor).stroke();

      let x = startX;
      row.forEach((data, i) => {
        doc.fillColor('#000').text(data, x + 3, y + 6, {
          width: colWidths[i] - 6,
          align: 'left',
        });
        x += colWidths[i];
      });

      y += rowHeight;
    });

    doc.end();
    res.json({ success: true, fileUrl: `/reports/${fileName}` });
  } catch (error) {
    console.error('Error generating system admin report:', error);
    res.status(500).json({ success: false, message: 'Error generating report' });
  }
};


export const generateDonorReport = async (req, res) => {
  try {
    const { bloodType } = req.query; // Get bloodType from query parameters
    const query = bloodType ? { bloodType } : {};
    
    const donors = await Donor.find(query)
      .select('firstName lastName email phoneNumber bloodType city dob activeStatus createdAt')
      .sort({ createdAt: -1 });

    if (!donors.length) {
      return res.status(404).json({ success: false, message: 'No donors found' });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const fileName = `donor_report_${bloodType || 'all'}_${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = `./reports/${fileName}`;

    if (!fs.existsSync('./reports')) {
      fs.mkdirSync('./reports');
    }

    doc.pipe(fs.createWriteStream(filePath));

    const logoPath = '../../frontend/src/assets/logo.svg';

    const generateHeader = () => {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 30, { width: 60 });
      }
      doc
        .fontSize(20)
        .fillColor('#FF2400')
        .text(`Donor List Report${bloodType ? ` - ${bloodType}` : ''}`, 0, 40, { align: 'center' });

      doc
        .moveDown()
        .fontSize(11)
        .fillColor('#555')
        .text(`Generated on: ${new Date().toDateString()}`, { align: 'right' });
    };

    const generateTableHeader = (y) => {
      const headers = ['#', 'Name', 'Email', 'Phone', 'Blood', 'City', 'DOB', 'Active'];
      const colWidths = [25, 80, 120, 80, 45, 60, 60, 40];
      const startX = 40;

      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), 25)
        .fill('#FF9280')
        .stroke();

      doc.font('Helvetica-Bold').fillColor('#fff').fontSize(10);
      let x = startX;
      headers.forEach((header, i) => {
        doc.text(header, x + 4, y + 7, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      return y + 25;
    };

    const colWidths = [25, 80, 120, 80, 45, 60, 60, 40];
    const startX = 40;
    const rowHeight = 30;
    const pageHeight = doc.page.height - 40;

    generateHeader();
    let y = 120;
    y = generateTableHeader(y);

    doc.font('Helvetica').fontSize(9);

    donors.forEach((item, index) => {
      if (y + rowHeight > pageHeight) {
        doc.addPage();
        generateHeader();
        y = 120;
        y = generateTableHeader(y);

        doc.font('Helvetica').fontSize(9);
      }

      const donorName = `${item.firstName} ${item.lastName}`;
      const row = [
        index + 1,
        donorName,
        item.email || 'N/A',
        item.phoneNumber || 'N/A',
        item.bloodType || 'N/A',
        item.city || 'N/A',
        item.dob ? item.dob.toDateString() : 'N/A',
        item.activeStatus ? 'Yes' : 'No',
      ];

      const bgColor = index % 2 === 0 ? '#ffffff' : '#f6f6f6';
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor).stroke();

      let x = startX;
      row.forEach((data, i) => {
        doc.fillColor('#000').text(data, x + 4, y + 6, {
          width: colWidths[i] - 8,
          align: 'left',
          height: rowHeight - 10,
        });
        x += colWidths[i];
      });

      y += rowHeight;
    });

    doc.end();
    res.json({ success: true, fileUrl: `/reports/${fileName}` });
  } catch (error) {
    console.error('Error generating donor report:', error);
    res.status(500).json({ success: false, message: 'Error generating report' });
  }
};

export const generateHospitalReport = async (req, res) => {
  try {
    const hospitals = await Hospital.find({})
      .select('name email phoneNumber city address startTime endTime activeStatus createdAt')
      .sort({ createdAt: -1 });

    if (!hospitals.length) {
      return res.status(404).json({ success: false, message: 'No hospitals found' });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const fileName = `hospital_report_${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = `./reports/${fileName}`;

    if (!fs.existsSync('./reports')) {
      fs.mkdirSync('./reports');
    }

    doc.pipe(fs.createWriteStream(filePath));

    const logoPath = '../../frontend/src/assets/logo.svg';

    const generateHeader = () => {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 30, { width: 60 });
      }

      doc
        .fontSize(20)
        .fillColor('#FF2400')
        .text('Hospital Report', 0, 40, { align: 'center' });

      doc
        .moveDown()
        .fontSize(11)
        .fillColor('#555')
        .text(`Generated on: ${new Date().toDateString()}`, { align: 'right' });
    };

    const generateTableHeader = (y) => {
      const headers = ['#', 'Name', 'Email', 'Phone', 'City', 'Address', 'Start', 'End', 'Active'];
      const colWidths = [20, 70, 90, 70, 60, 100, 40, 40, 40];
      const startX = 40;

      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), 25)
        .fill('#FF9280')
        .stroke();

      doc.font('Helvetica-Bold').fillColor('#fff').fontSize(10);
      let x = startX;
      headers.forEach((header, i) => {
        doc.text(header, x + 4, y + 7, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      return y + 25;
    };

    const colWidths = [20, 70, 90, 70, 60, 100, 40, 40, 40];
    const startX = 40;
    const rowHeight = 30;
    const pageHeight = doc.page.height - 40;

    generateHeader();
    let y = 120;
    y = generateTableHeader(y);

    doc.font('Helvetica').fontSize(9);

    hospitals.forEach((item, index) => {
      if (y + rowHeight > pageHeight) {
        doc.addPage();
        generateHeader();
        y = 120;
        y = generateTableHeader(y);
        
        doc.font('Helvetica').fontSize(9);
      }

      const row = [
        index + 1,
        item.name || 'N/A',
        item.email || 'N/A',
        item.phoneNumber || 'N/A',
        item.city || 'N/A',
        item.address || 'N/A',
        item.startTime || 'N/A',
        item.endTime || 'N/A',
        item.activeStatus ? 'Yes' : 'No',
      ];

      const bgColor = index % 2 === 0 ? '#ffffff' : '#f6f6f6';
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor).stroke();

      let x = startX;
      row.forEach((data, i) => {
        doc.fillColor('#000').text(data, x + 4, y + 6, {
          width: colWidths[i] - 8,
          align: 'left',
          height: rowHeight - 10,
        });
        x += colWidths[i];
      });

      y += rowHeight;
    });

    doc.end();
    res.json({ success: true, fileUrl: `/reports/${fileName}` });
  } catch (error) {
    console.error('Error generating hospital report:', error);
    res.status(500).json({ success: false, message: 'Error generating report' });
  }
};
export const generateEmergencyBRReport = async (req, res) => {
  try {
    const { bloodGroup, criticalLevel, status } = req.query; // Get filter parameters from query

    // Build query object based on provided filters
    const query = {};
    if (bloodGroup) query.patientBlood = bloodGroup;
    if (criticalLevel) query.criticalLevel = criticalLevel;
    if (status) query.acceptStatus = status;

    const requests = await EmergencyBR.find(query)
      .select('name patientBlood criticalLevel hospitalName acceptStatus')
      .sort({ createdAt: -1 });

    if (!requests.length) {
      return res.status(404).json({ success: false, message: 'No emergency blood requests found' });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    // Include filters in the filename for clarity
    const filterString = [
      bloodGroup ? `blood_${bloodGroup.replace(/\+|-/, '')}` : '',
      criticalLevel ? `critical_${criticalLevel.toLowerCase()}` : '',
      status ? `status_${status.toLowerCase()}` : ''
    ].filter(Boolean).join('_');
    const fileName = `emergency_br_report${filterString ? `_${filterString}` : ''}_${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = `./reports/${fileName}`;

    if (!fs.existsSync('./reports')) {
      fs.mkdirSync('./reports', { recursive: true });
    }

    doc.pipe(fs.createWriteStream(filePath));

    // Add logo
    const logoPath = '../../frontend/src/assets/logo.svg';
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 30, { width: 80 });
    }

    // Header
    let headerText = 'Emergency Blood Request Report';
    if (bloodGroup || criticalLevel || status) {
      headerText += ' (Filtered)';
      const filters = [];
      if (bloodGroup) filters.push(`Blood Group: ${bloodGroup}`);
      if (criticalLevel) filters.push(`Critical Level: ${criticalLevel}`);
      if (status) filters.push(`Status: ${status}`);
      headerText += ` - ${filters.join(', ')}`;
    }
    doc.fontSize(18).fillColor('#000').text(headerText, 0, 50, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toDateString()}`, { align: 'right' });

    // Table setup
    const tableTop = 130;
    const rowHeight = 25;
    const colWidths = [100, 150, 80, 100, 100]; // Adjusted for 5 columns
    const startX = 40;
    const headers = ['Patient Name', 'Hospital', 'Blood Group', 'Critical Level', 'Status'];

    let y = tableTop;

    // Draw header background
    doc.rect(startX, y, colWidths.reduce((a, b) => a + b), rowHeight).fill('#FF9280').stroke(); // Consistent with other reports
    doc.font('Helvetica-Bold').fillColor('#fff').fontSize(10);

    let x = startX;
    headers.forEach((header, i) => {
      doc.text(header, x + 2, y + 7, { width: colWidths[i] - 4, align: 'left' });
      x += colWidths[i];
    });

    y += rowHeight;

    // Draw rows
    doc.font('Helvetica').fontSize(9);
    const pageHeight = doc.page.height - 40;

    requests.forEach((item, index) => {
      if (y + rowHeight > pageHeight) {
        doc.addPage();
        y = 100;
        // Redraw header on new page
        doc.rect(startX, y, colWidths.reduce((a, b) => a + b), rowHeight).fill('#FF9280').stroke();
        doc.font('Helvetica-Bold').fillColor('#fff').fontSize(10);
        x = startX;
        headers.forEach((header, i) => {
          doc.text(header, x + 2, y + 7, { width: colWidths[i] - 4, align: 'left' });
          x += colWidths[i];
        });
        y += rowHeight;
        doc.font('Helvetica').fontSize(9);
      }

      x = startX;
      const row = [
        item.name || 'N/A',
        item.hospitalName || 'N/A',
        item.patientBlood || 'N/A',
        item.criticalLevel || 'N/A',
        item.acceptStatus || 'N/A'
      ];

      // Row background alternating color
      const bgColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor).stroke();

      // Draw text for each column
      x = startX;
      row.forEach((data, i) => {
        doc.fillColor('#000').text(data, x + 2, y + 7, { width: colWidths[i] - 4, align: 'left', height: rowHeight - 10 });
        x += colWidths[i];
      });

      y += rowHeight;
    });

    doc.end();
    res.json({ success: true, fileUrl: `/reports/${fileName}` });
  } catch (error) {
    console.error('Error generating emergency blood request report:', error);
    res.status(500).json({ success: false, message: 'Error generating report' });
  }
};

export const generateHospitalAdminReport = async (req, res) => {
  try {
    const { userId } = req.query;

    // Validate hospitalId
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Hospital ID is required' });
    }

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid hospital ID format' });
    }

    // Fetch hospital admins
    const admins = await HospitalAdmin.find({ hospitalId:userId })
      .select('firstName lastName email phoneNumber nic dob activeStatus')
      .sort({ createdAt: -1 });

    if (!admins.length) {
      return res.status(404).json({ success: false, message: 'No hospital admins found for this hospital' });
    }

    // Initialize PDF document
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const fileName = `hospital_admin_report_${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = `./reports/${fileName}`;

    // Create reports directory if it doesn't exist
    if (!fs.existsSync('./reports')) {
      fs.mkdirSync('./reports');
    }

    // Pipe PDF to file
    doc.pipe(fs.createWriteStream(filePath));

    const logoPath = '../../frontend/src/assets/logo.svg';

    const generateHeader = () => {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 30, { width: 60 });
      }

      doc
        .fontSize(20)
        .fillColor('#FF2400')
        .text('Hospital Admin Report', 0, 40, { align: 'center' });

      doc
        .moveDown()
        .fontSize(11)
        .fillColor('#555')
        .text(`Generated on: ${new Date().toDateString()}`, { align: 'right' });
369    };

    const generateTableHeader = (y) => {
      const headers = ['#', 'Name', 'Email', 'Phone', 'NIC', 'DOB', 'Active'];
      const colWidths = [20, 90, 100, 70, 70, 60, 50];
      const startX = 40;

      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), 25)
        .fill('#FF9280')
        .stroke();

      doc.font('Helvetica-Bold').fillColor('#fff').fontSize(10);
      let x = startX;
      headers.forEach((header, i) => {
        doc.text(header, x + 4, y + 7, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      return y + 25;
    };

    const colWidths = [20, 90, 100, 70, 70, 60, 50];
    const startX = 40;
    const rowHeight = 30;
    const pageHeight = doc.page.height - 40;

    generateHeader();
    let y = 120;
    y = generateTableHeader(y);

    doc.font('Helvetica').fontSize(9);

    admins.forEach((admin, index) => {
      if (y + rowHeight > pageHeight) {
        doc.addPage();
        generateHeader();
        y = 120;
        y = generateTableHeader(y);
        
        doc.font('Helvetica').fontSize(9);
      }

      const row = [
        index + 1,
        `${admin.firstName} ${admin.lastName}` || 'N/A',
        admin.email || 'N/A',
        admin.phoneNumber || 'N/A',
        admin.nic || 'N/A',
        moment(admin.dob).format('YYYY-MM-DD') || 'N/A',
        admin.activeStatus ? 'Yes' : 'No',
      ];

      const bgColor = index % 2 === 0 ? '#ffffff' : '#f6f6f6';
      doc.rect(startX, y, colWidths.reduce((a, b) => a + b), rowHeight).fill(bgColor).stroke();

      let x = startX;
      row.forEach((data, i) => {
        doc.fillColor('#000').text(data, x + 4, y + 6, {
          width: colWidths[i] - 8,
          align: 'left',
          height: rowHeight - 10,
        });
        x += colWidths[i];
      });

      y += rowHeight;
    });

    // Finalize PDF
    doc.end();
    res.json({ success: true, fileUrl: `/reports/${fileName}` });
  } catch (error) {
    console.error('Error generating hospital admin report:', error);
    res.status(500).json({ success: false, message: 'Error generating report' });
  }
};