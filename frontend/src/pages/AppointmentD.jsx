import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Label, TextInput, Textarea, Select, Spinner } from "flowbite-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { useBloodDonationAppointment } from "../hooks/useBloodDonationAppointment";
import { useSecondAuth } from "../hooks/useSecondAuth";
import { useAuthContext } from "../hooks/useAuthContext";
import { useFeedback } from "../hooks/useFeedback";
import { useGenerateReport } from "../hooks/useGenerateReport";

export default function HealthEvaluationD() {
  const {
    appointments,
    fetchAppointments,
    deleteAppointment,
    updateAppointmentDateTime,
    arrivedForAppointment,
    acceptAppointment,
    cancelAppointment,
    completeAppointment,
    cancelAppointmentDonor,
    fetchBloodDonationAppointmentByHospitalId,
    fetchBloodDonationAppointmentByDonorId,
  } = useBloodDonationAppointment();

  const { createFeedback } = useFeedback();
  const { user } = useAuthContext();
  const { secondUser } = useSecondAuth();

  // User and role setup
  const userId = user?.userObj?._id;
  const Donor = user?.role === 'Donor';
  const Hospital = user?.role === 'Hospital';
  const Manager = user?.role === 'Manager';
  const HospitalAdmin = secondUser?.role === 'HospitalAdmin';
  const hospitalAdminId = secondUser?.userObj?._id;

  // State for reschedule modal
  const [openRescheduleModal, setOpenRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduleErrors, setRescheduleErrors] = useState({});

  // State for arrived modal
  const [openArrivedModal, setOpenArrivedModal] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState("");
  const [arrivedErrors, setArrivedErrors] = useState({});

  // State for feedback modal
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [comments, setComments] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [starRating, setStarRating] = useState("");
  const [feedbackErrors, setFeedbackErrors] = useState({});

  // Loading and error state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { reportUrl, generateAppointmentReport } = useGenerateReport();

  // Fetch appointments based on role
  useEffect(() => {
    if (!userId) return;
    if (Donor) {
      fetchBloodDonationAppointmentByDonorId(userId);
    } else if (Hospital) {
      fetchBloodDonationAppointmentByHospitalId(userId);
    } else {
      fetchAppointments();
    }
  }, [userId, Donor, Hospital, fetchAppointments, fetchBloodDonationAppointmentByDonorId, fetchBloodDonationAppointmentByHospitalId]);

  // Validation functions
  const validateRescheduleForm = () => {
    const errors = {};
    if (!newDate) errors.newDate = "Date is required";
    else if (new Date(newDate) < new Date().setHours(0, 0, 0, 0)) errors.newDate = "Date cannot be in the past";
    if (!newTime) errors.newTime = "Time is required";
    setRescheduleErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateArrivedForm = () => {
    const errors = {};
    if (!receiptNumber) errors.receiptNumber = "Receipt number is required";
    else if (!/^[A-Za-z0-9-]+$/.test(receiptNumber)) errors.receiptNumber = "Receipt number can only contain letters, numbers, and hyphens";
    setArrivedErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateFeedbackForm = () => {
    const errors = {};
    if (!subject) errors.subject = "Subject is required";
    if (!comments) errors.comments = "Comments are required";
    if (!feedbackType) errors.feedbackType = "Feedback type is required";
    if (starRating && (starRating < 1 || starRating > 5)) errors.starRating = "Rating must be between 1 and 5";
    setFeedbackErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reschedule handlers
  const handleRescheduleClick = (appointment) => {
    setSelectedAppointment(appointment);
    setNewDate(appointment.appointmentDate || "");
    setNewTime(appointment.appointmentTime || "");
    setRescheduleErrors({});
    setOpenRescheduleModal(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!validateRescheduleForm()) return;
    setLoading(true);
    setErrorMessage("");
    try {
      await updateAppointmentDateTime(selectedAppointment._id, newDate, newTime, hospitalAdminId);
      setOpenRescheduleModal(false);
    } catch (error) {
      setErrorMessage("Failed to reschedule appointment. Please try again.");
      console.error("Error rescheduling appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  // Arrived handlers
  const handleArrivedClick = (appointment) => {
    setSelectedAppointment(appointment);
    setReceiptNumber(appointment.receiptNumber || "");
    setArrivedErrors({});
    setOpenArrivedModal(true);
  };

  const handleArrivedSubmit = async () => {
    if (!validateArrivedForm()) return;
    setLoading(true);
    setErrorMessage("");
    try {
      await arrivedForAppointment(selectedAppointment._id, receiptNumber);
      setOpenArrivedModal(false);
    } catch (error) {
      setErrorMessage("Failed to confirm arrival. Please try again.");
      console.error("Error confirming arrival:", error);
    } finally {
      setLoading(false);
    }
  };

  // Feedback handlers
  const handleFeedbackClick = (appointment) => {
    setSelectedAppointment(appointment);
    setSubject("");
    setComments("");
    setFeedbackType("");
    setStarRating("");
    setFeedbackErrors({});
    setOpenFeedbackModal(true);
  };

  const handleFeedbackSubmit = async () => {
    if (!validateFeedbackForm()) return;
    const feedbackData = {
      donorId: userId,
      sessionId: selectedAppointment._id,
      sessionModel: "BloodDonationAppointment",
      subject,
      comments,
      feedbackType,
      starRating,
    };
    setLoading(true);
    setErrorMessage("");
    try {
      await createFeedback(feedbackData);
      setOpenFeedbackModal(false);
    } catch (error) {
      setErrorMessage("Failed to submit feedback. Please try again.");
      console.error("Error submitting feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    generateAppointmentReport(user.userObj._id);
};

  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-red-700">Appointments</h1>
          <Button gradientDuoTone="redToPink" onClick={handleGenerateReport} disabled={loading}> 
           Generate Report
           </Button>

           {reportUrl && (
                <div>
                    <p>Report generated successfully!</p>
                    <a href={`http://localhost:3020${reportUrl}`} download>
                        Download Report
                    </a>
                </div>
                    )}


        </div>

        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Receipt No.</Table.HeadCell>
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>Time</Table.HeadCell>
            <Table.HeadCell>Progress Status</Table.HeadCell>
            <Table.HeadCell>Hospital</Table.HeadCell>
            <Table.HeadCell>Donor</Table.HeadCell>
            <Table.HeadCell>Admin</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <Table.Row key={appointment._id} className="bg-white">
                  <Table.Cell>{appointment.receiptNumber || "N/A"}</Table.Cell>
                  <Table.Cell>{new Date(appointment.appointmentDate).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>{appointment.appointmentTime || "N/A"}</Table.Cell>
                  <Table.Cell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.progressStatus === "Completed"
                          ? "bg-green-100 text-green-700"
                          : appointment.progressStatus === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {appointment.progressStatus}
                    </span>
                  </Table.Cell>
                  <Table.Cell>{appointment.hospitalId?.name || "N/A"}</Table.Cell>
                  <Table.Cell>{appointment?.donorId?.firstName + " " +  appointment?.donorId?.lastName || "N/A"}</Table.Cell>
                  <Table.Cell>{appointment?.hospitalAdminId?.firstName + " " +  appointment?.hospitalAdminId?.lastName || "N/A"}</Table.Cell>
                  <Table.Cell className="space-x-2">
                    <div className="flex flex-row gap-2">
                      {Hospital && HospitalAdmin && (
                        <>
                          {appointment.activeStatus !== "Cancelled" &&
                            appointment.activeStatus !== "Re-Scheduled" &&
                            appointment.activeStatus !== "Accepted" && (
                              <Button
                                size="xs"
                                color="warning"
                                onClick={() => handleRescheduleClick(appointment)}
                              >
                                Reschedule
                              </Button>
                            )}
                          {appointment.activeStatus !== "Cancelled" &&
                            appointment.activeStatus !== "Accepted" && (
                              <Button
                                size="xs"
                                color="gray"
                                onClick={() => cancelAppointment(appointment._id, hospitalAdminId)}
                              >
                                Cancel
                              </Button>
                            )}
                          {appointment.activeStatus !== "Cancelled" &&
                            appointment.activeStatus !== "Accepted" &&
                            appointment.activeStatus !== "Re-Scheduled" && (
                              <Button
                                size="xs"
                                color="gray"
                                onClick={() => acceptAppointment(appointment._id, hospitalAdminId)}
                              >
                                Accept
                              </Button>
                            )}
                          {(appointment.activeStatus === "Accepted" &&
                            appointment.progressStatus === "Completed") ||
                          (appointment.activeStatus === "Cancelled" &&
                            appointment.progressStatus === "Cancelled") ? (
                            <Button
                              size="xs"
                              color="failure"
                              onClick={() => deleteAppointment(appointment._id)}
                            >
                              Delete
                            </Button>
                          ) : null}
                          {appointment.progressStatus === "Not Started" &&
                            appointment.activeStatus === "Accepted" && (
                              <Button
                                size="xs"
                                color="success"
                                onClick={() => handleArrivedClick(appointment)}
                              >
                                Arrived
                              </Button>
                            )}
                          {appointment.progressStatus === "In Progress" &&
                            appointment.activeStatus === "Accepted" && (
                              <Button
                                size="xs"
                                color="success"
                                onClick={() => completeAppointment(appointment._id, hospitalAdminId)}
                              >
                                Completed
                              </Button>
                            )}
                        </>
                      )}
                      {Donor && (
                        <>
                          {appointment.activeStatus === "Re-Scheduled" &&
                            appointment.activeStatus !== "Cancelled" && (
                              <Button
                                size="xs"
                                color="gray"
                                onClick={() => cancelAppointmentDonor(appointment._id)}
                              >
                                Cancel
                              </Button>
                            )}
                          {appointment.activeStatus !== "Cancelled" &&
                            appointment.activeStatus !== "Accepted" &&
                            appointment.activeStatus === "Re-Scheduled" && (
                              <Button
                                size="xs"
                                color="gray"
                                onClick={() => acceptAppointment(appointment._id, hospitalAdminId)}
                              >
                                Accept
                              </Button>
                            )}
                          {appointment.activeStatus !== "Cancelled" && (
                            <Button
                              size="xs"
                              color="gray"
                              onClick={() => handleFeedbackClick(appointment)}
                            >
                              Feedback
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan="8" className="text-center py-4 text-gray-500">
                  No appointments found
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>

      {/* Reschedule Modal */}
      <Modal show={openRescheduleModal} onClose={() => setOpenRescheduleModal(false)}>
        <Modal.Header>Reschedule Appointment</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label value="New Date" />
              <TextInput
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                color={rescheduleErrors.newDate ? "failure" : "gray"}
              />
              {rescheduleErrors.newDate && (
                <p className="text-red-600 text-sm mt-1">{rescheduleErrors.newDate}</p>
              )}
            </div>
            <div>
              <Label value="New Time" />
              <TextInput
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
                color={rescheduleErrors.newTime ? "failure" : "gray"}
              />
              {rescheduleErrors.newTime && (
                <p className="text-red-600 text-sm mt-1">{rescheduleErrors.newTime}</p>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            gradientDuoTone="redToPink"
            onClick={handleRescheduleSubmit}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" className="mr-2" /> : null}
            {loading ? "Saving..." : "Save"}
          </Button>
          <Button color="gray" onClick={() => setOpenRescheduleModal(false)} disabled={loading}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Arrived Modal */}
      <Modal show={openArrivedModal} onClose={() => setOpenArrivedModal(false)}>
        <Modal.Header>Confirm Arrival</Modal.Header>
        <Modal.Body>
          <div>
            <Label value="Receipt Number" />
            <TextInput
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              required
              color={arrivedErrors.receiptNumber ? "failure" : "gray"}
            />
            {arrivedErrors.receiptNumber && (
              <p className="text-red-600 text-sm mt-1">{arrivedErrors.receiptNumber}</p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            gradientDuoTone="redToPink"
            onClick={handleArrivedSubmit}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" className="mr-2" /> : null}
            {loading ? "Confirming..." : "Confirm"}
          </Button>
          <Button color="gray" onClick={() => setOpenArrivedModal(false)} disabled={loading}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Feedback Modal */}
      <Modal show={openFeedbackModal} onClose={() => setOpenFeedbackModal(false)}>
        <Modal.Header>Submit Feedback</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label value="Subject" />
              <TextInput
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                color={feedbackErrors.subject ? "failure" : "gray"}
              />
              {feedbackErrors.subject && (
                <p className="text-red-600 text-sm mt-1">{feedbackErrors.subject}</p>
              )}
            </div>
            <div>
              <Label value="Comments" />
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                required
                color={feedbackErrors.comments ? "failure" : "gray"}
              />
              {feedbackErrors.comments && (
                <p className="text-red-600 text-sm mt-1">{feedbackErrors.comments}</p>
              )}
            </div>
            <div>
              <Label value="Feedback Type" />
              <Select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                required
                color={feedbackErrors.feedbackType ? "failure" : "gray"}
              >
                <option value="">Select Feedback Type</option>
                <option value="General Feedback">General Feedback</option>
                <option value="Technical Feedback">Technical Feedback</option>
                <option value="Complaint Feedback">Complaint Feedback</option>
              </Select>
              {feedbackErrors.feedbackType && (
                <p className="text-red-600 text-sm mt-1">{feedbackErrors.feedbackType}</p>
              )}
            </div>
            <div>
              <Label value="Star Rating (Optional)" />
              <TextInput
                type="number"
                min="1"
                max="5"
                value={starRating}
                onChange={(e) => setStarRating(e.target.value)}
                color={feedbackErrors.starRating ? "failure" : "gray"}
              />
              {feedbackErrors.starRating && (
                <p className="text-red-600 text-sm mt-1">{feedbackErrors.starRating}</p>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            gradientDuoTone="redToPink"
            onClick={handleFeedbackSubmit}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" className="mr-2" /> : null}
            {loading ? "Submitting..." : "Submit"}
          </Button>
          <Button color="gray" onClick={() => setOpenFeedbackModal(false)} disabled={loading}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Error Message */}
      {errorMessage && (
        <div className="text-red-600 text-center mt-4">{errorMessage}</div>
      )}
    </div>
  );
}