import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import uitoolkit, { CustomizationOptions } from '@zoom/videosdk-ui-toolkit';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'zoomvideosdk';
  sessionContainer: any;
  zoomDetails: any;
  isVideoStarted: boolean = false;
  inSession: boolean = false;
  config: CustomizationOptions = {
    videoSDKJWT: '',
    sessionName: '',
    userName: String('Ankush Dubey'),
    sessionPasscode: '',
    features: ['video', 'audio', 'settings', 'users', 'chat', 'share'],
    options: {
      init: { enforceMultipleVideos: true, enforceVirtualBackground: false },
      audio: {},
      video: { originalRatio: true },
      share: {},
    },
  };
  constructor(private http: HttpClient) {}

  StartVideoSDKJWT() {
this.isVideoStarted=true;
    this.http.post<any>('http://localhost:57986/api/Zoom/startcall', '').subscribe((response) => {
      if (response?.status) {
        this.zoomDetails = response.data;
        setTimeout(() => {
          this.sessionContainer = document.getElementById('sessionContainer');
          this.JoinZoomCall(this.zoomDetails);
        }, 100);
      }
    });
  }

  sessionDestroyed = () => {
    console.log('Zoom session destroyed');
    uitoolkit.destroy();
  };

  sessionJoined = () => {
    console.log('Zoom session joined');
  };
  sessionClosed = () => {
    console.log('Session closed: patient left the call');

    // If you manually want to clean up UI:
    this.inSession = false;

    if (this.sessionContainer && this.sessionContainer.parentNode) {
      this.sessionContainer.parentNode.removeChild(this.sessionContainer);
      this.sessionContainer = null;
    }

    this.resetSessionContainer();
  };

  JoinZoomCall(data: any = null) {
    const joiningDetails = {
      signature: data?.signature || '',
      sessionName: data?.sessionName || '',
      sessionPasscode: data?.sessionPasscode || '',
      appointmentId: data?.appointmentId || '',
      providerUserId: data?.providerUserId || null,
      nurseUserId: data?.nurseUserId || null,
    };

    // Set Zoom config
    this.config.videoSDKJWT = joiningDetails?.signature;
    this.config.sessionName = joiningDetails?.sessionName;
    this.config.userName = 'Ankush';
    this.config.sessionPasscode =
      joiningDetails?.sessionPasscode?.substring(0, 10) || '';

    uitoolkit.joinSession(this.sessionContainer, this.config);
    console.log('this.sessionClosed', this.sessionClosed);
    uitoolkit.onSessionClosed(this.sessionClosed);
    uitoolkit.onSessionDestroyed(this.sessionDestroyed);
    uitoolkit.onSessionJoined(this.sessionJoined);
  }

  resetSessionContainer() {
    this.sessionContainer?.remove(); // remove old DOM
    const wrapper = document.getElementById('zoom-wrapper');
    const newContainer = document.createElement('div');
    newContainer.id = 'sessionContainer';
    newContainer.className = 'zoom-fullscreen-container';
    wrapper?.appendChild(newContainer);
    this.sessionContainer = newContainer;
  }
}
