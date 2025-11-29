import { Layout } from '@/components/layout/Layout';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { appointmentService } from '@/services/appointment-service';
import type { Doctor, Appointment } from '@/types/appointment';
import { Search, Video, Calendar, Clock, Star, Award, Languages, DollarSign, CheckCircle, XCircle, AlertCircle, ExternalLink, Phone, Mail, MapPin, Share2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const VideoConsultation = () => {
  const { elderlyMode, user } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [instantCallDialogOpen, setInstantCallDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState('find-doctor');

  // Load appointments
  const loadAppointments = () => {
    if (user) {
      setAppointments(appointmentService.getAppointments(user.id));
    }
  };

  // Get doctors
  const doctors = searchQuery
    ? appointmentService.searchDoctors(searchQuery)
    : appointmentService.getDoctors();

  // Handle booking
  const handleBookAppointment = () => {
    if (!user || !selectedDoctor) return;

    if (!selectedDate || !selectedTime || !reason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const appointment = appointmentService.bookAppointment(user.id, {
        doctorId: selectedDoctor.id,
        date: selectedDate,
        time: selectedTime,
        reason: reason.trim(),
        symptoms: symptoms.trim() || undefined,
      });

      toast.success(`Appointment booked with ${selectedDoctor.name}!`);
      setBookingDialogOpen(false);
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedTime('');
      setReason('');
      setSymptoms('');
      loadAppointments();
      setActiveTab('appointments');
    } catch (error: any) {
      toast.error(error.message || 'Failed to book appointment');
    }
  };

  // Handle cancel
  const handleCancelAppointment = (appointmentId: string) => {
    try {
      appointmentService.cancelAppointment(appointmentId);
      toast.success('Appointment cancelled');
      loadAppointments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel appointment');
    }
  };

  // Handle join meeting
  const handleJoinMeeting = (appointment: Appointment) => {
    if (appointment.meetingUrl) {
      appointmentService.updateAppointmentStatus(appointment.id, 'in-progress');
      window.open(appointment.meetingUrl, '_blank');
      loadAppointments();
    }
  };

  // Handle instant call
  const handleInstantCall = () => {
    if (!user || !selectedDoctor) return;

    if (!reason.trim()) {
      toast.error('Please enter a reason for consultation');
      return;
    }

    try {
      const appointment = appointmentService.createInstantConsultation(
        user.id,
        selectedDoctor.id,
        reason.trim()
      );

      toast.success('Instant consultation created!');
      setInstantCallDialogOpen(false);
      setSelectedDoctor(null);
      setReason('');
      
      // Open meeting immediately
      if (appointment.meetingUrl) {
        window.open(appointment.meetingUrl, '_blank');
      }
      
      loadAppointments();
      setActiveTab('appointments');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create instant consultation');
    }
  };

  // Handle share meeting link
  const handleShareLink = (appointment: Appointment) => {
    const result = appointmentService.shareMeetingLink(appointment.id);
    if (result.success) {
      toast.success(result.message);
      loadAppointments();
    } else {
      toast.error(result.message);
    }
  };

  // Handle external platform booking
  const handleExternalBooking = (doctor: Doctor) => {
    if (doctor.platformUrl) {
      window.open(doctor.platformUrl, '_blank');
      toast.info(`Opening ${doctor.platform?.toUpperCase()} to book with ${doctor.name}`);
    }
  };

  // Load appointments on mount
  useState(() => {
    loadAppointments();
  });

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-500';
      case 'in-progress':
        return 'bg-green-500/10 text-green-500';
      case 'completed':
        return 'bg-gray-500/10 text-gray-500';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Video className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className={cn('font-bold', elderlyMode ? 'text-3xl' : 'text-2xl')}>
            Video Consultation
          </h1>
          <p className="text-muted-foreground mt-1">
            Book appointments and consult with healthcare professionals online
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="find-doctor">Find a Doctor</TabsTrigger>
            <TabsTrigger value="appointments">My Appointments</TabsTrigger>
          </TabsList>

          {/* Find Doctor Tab */}
          <TabsContent value="find-doctor" className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search by doctor name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            {/* Doctor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doctor) => (
                <Card key={doctor.id} className="glass hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className={cn(elderlyMode && 'text-lg')}>{doctor.name}</CardTitle>
                        <CardDescription>{doctor.specialty}</CardDescription>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{doctor.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="w-4 h-4" />
                      <span>{doctor.qualifications}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{doctor.experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Languages className="w-4 h-4" />
                      <span>{doctor.languages.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <DollarSign className="w-4 h-4" />
                      <span>${doctor.consultationFee} per session</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{doctor.bio}</p>
                    
                    {/* Platform Badge */}
                    {doctor.platform && (
                      <Badge variant="outline" className="text-xs">
                        Available on {doctor.platform.toUpperCase()}
                      </Badge>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-1">
                      {doctor.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{doctor.phone}</span>
                        </div>
                      )}
                      {doctor.email && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{doctor.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        className="gradient-primary"
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setBookingDialogOpen(true);
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Book
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setInstantCallDialogOpen(true);
                        }}
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Instant
                      </Button>
                    </div>

                    {/* External Platform Link */}
                    {doctor.platformUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => handleExternalBooking(doctor)}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Book on {doctor.platform?.toUpperCase()}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            {appointments.length === 0 ? (
              <Card className="glass">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No appointments yet. Book your first consultation!
                  </p>
                  <Button
                    className="mt-4 gradient-primary"
                    onClick={() => setActiveTab('find-doctor')}
                  >
                    Find a Doctor
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <Card key={appointment.id} className="glass">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{appointment.doctor.name}</h3>
                            <Badge className={getStatusColor(appointment.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(appointment.status)}
                                {appointment.status}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{appointment.doctor.specialty}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(appointment.scheduledDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{appointment.scheduledTime}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Reason:</p>
                            <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {appointment.status === 'scheduled' || appointment.status === 'confirmed' ? (
                            <>
                              <Button
                                className="gradient-primary"
                                onClick={() => handleJoinMeeting(appointment)}
                              >
                                <Video className="w-4 h-4 mr-2" />
                                Join Meeting
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleShareLink(appointment)}
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                {appointment.linkSentToDoctor ? 'Resend Link' : 'Share Link'}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleCancelAppointment(appointment.id)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : appointment.status === 'in-progress' ? (
                            <>
                              <Button
                                className="gradient-primary"
                                onClick={() => handleJoinMeeting(appointment)}
                              >
                                <Video className="w-4 h-4 mr-2" />
                                Rejoin Meeting
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleShareLink(appointment)}
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share Link
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Booking Dialog */}
        <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Book Appointment</DialogTitle>
              <DialogDescription>
                Schedule a video consultation with {selectedDoctor?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="reason">Reason for Consultation *</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Brief description of your health concern..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="symptoms">Symptoms (Optional)</Label>
                <Textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="List any symptoms you're experiencing..."
                  className="mt-1"
                  rows={2}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-muted-foreground">
                  Consultation Fee: <span className="font-medium">${selectedDoctor?.consultationFee}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="gradient-primary" onClick={handleBookAppointment}>
                    Confirm Booking
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Instant Call Dialog */}
        <Dialog open={instantCallDialogOpen} onOpenChange={setInstantCallDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Instant Consultation</DialogTitle>
              <DialogDescription>
                Start an immediate video call with {selectedDoctor?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">How it works:</p>
                    <ol className="text-sm text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
                      <li>Meeting link will be created instantly</li>
                      <li>You'll join the video call immediately</li>
                      <li>Share the link with doctor via phone/email</li>
                      <li>Doctor can join using the shared link</li>
                    </ol>
                  </div>
                </div>
              </div>

              {selectedDoctor && (
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Doctor Contact:</p>
                  {selectedDoctor.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{selectedDoctor.phone}</span>
                    </div>
                  )}
                  {selectedDoctor.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{selectedDoctor.email}</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="instant-reason">Reason for Consultation *</Label>
                <Textarea
                  id="instant-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Brief description of your health concern..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-muted-foreground">
                  Fee: <span className="font-medium">${selectedDoctor?.consultationFee}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setInstantCallDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="gradient-primary" onClick={handleInstantCall}>
                    <Zap className="w-4 h-4 mr-2" />
                    Start Now
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default VideoConsultation;
