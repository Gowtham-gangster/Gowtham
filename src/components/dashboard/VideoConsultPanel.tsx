import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Video } from 'lucide-react';

// Simple Jitsi embed based video consult panel
export const VideoConsultPanel: React.FC<{ elderlyMode?: boolean }> = ({ elderlyMode }) => {
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'speaker'>('grid');
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);

  const startMeeting = () => {
    if (!room) setRoom(`medroom-${Math.random().toString(36).slice(2,8)}`);
    setJoined(true);
  };

  const toggleLayout = () => setLayout((l) => (l === 'grid' ? 'speaker' : 'grid'));
  const toggleMute = () => setMuted((m) => !m);
  const toggleCamera = () => setCameraOn((c) => !c);

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className={cn('flex items-center gap-2')}>
          <Video />
          Video Consultation
        </CardTitle>
      </CardHeader>
      <CardContent className={cn('space-y-3', elderlyMode && 'p-6')}>
        <p className="text-sm text-muted-foreground">Start a secure video call with your doctor. Uses Jitsi Meet (no account required).</p>
        {!joined ? (
          <div className="flex gap-2">
            <Input placeholder="Room name (optional)" value={room} onChange={(e) => setRoom(e.target.value)} />
            <Button onClick={startMeeting}>Start</Button>
          </div>
        ) : (
          <div>
            <div style={{ height: 420 }}>
              <iframe
                title="Jitsi Meeting"
                src={`https://meet.jit.si/${encodeURIComponent(room)}`}
                allow="camera; microphone; fullscreen; display-capture"
                style={{ width: '100%', height: '100%', border: 0 }}
              />
            </div>
            <div className="pt-2 flex gap-2">
              <Button variant="outline" onClick={() => setJoined(false)}>Leave</Button>
              <Button variant="outline" onClick={toggleLayout}>{layout === 'grid' ? 'Speaker View' : 'Gallery View'}</Button>
              <Button variant="outline" onClick={toggleMute}>{muted ? 'Unmute' : 'Mute'}</Button>
              <Button variant="outline" onClick={toggleCamera}>{cameraOn ? 'Camera Off' : 'Camera On'}</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoConsultPanel;
