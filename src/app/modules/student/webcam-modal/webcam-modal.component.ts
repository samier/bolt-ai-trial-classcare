import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Toastr } from 'src/app/core/services/toastr';
import {Subject, Observable} from 'rxjs';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';

@Component({
  selector: 'app-webcam-modal',
  templateUrl: './webcam-modal.component.html',
  styleUrls: ['./webcam-modal.component.scss']
})
export class WebcamModalComponent implements OnInit {
   // toggle webcam on/off
   public showWebcam = true;
   public allowCameraSwitch = true;
   public multipleWebcamsAvailable = false;
   public deviceId: string | undefined;
   public videoOptions: MediaTrackConstraints = {
     // width: {ideal: 1024},
     // height: {ideal: 576}
   };
   public errors: WebcamInitError[] = [];
   public isCamAvailable = true;
 
   // latest snapshot
   public webcamImage: WebcamImage | undefined;
 
   // webcam snapshot trigger
   private trigger: Subject<void> = new Subject<void>();
   // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
   private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();

   constructor(
     public modalRef: NgbActiveModal,
     public toastr: Toastr,
   ) {}
 
   public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.modalRef.close({
      image64: webcamImage.imageAsDataUrl
    })
  }

  public cameraWasSwitched(deviceId: string): void {
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }
 
  closeModal() {
    this.modalRef.dismiss();
  }
}
