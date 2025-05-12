import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TransportService } from '../transport.service';
import { MapsAPILoader } from '@agm/core';

declare var google: any;

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss']
})
export class LocationPickerComponent implements OnInit {
  
  @ViewChild('placeInputRef', { static: true }) placeInputRef: any;
  lat:any;
  lng:any;
  zoom = 4;
  mapClickListener:any;
  map:any;
  marker: any;

  queryWait!: boolean;

  constructor(
    private TransportService: TransportService,
    private modalRef: NgbActiveModal,
    private zone: NgZone,
    private mapsAPILoader: MapsAPILoader
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.initAutocomplete();
  }

  initAutocomplete(): void {
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('placeInput'),
        {
          types: ['geocode']
        }
      );

      autocomplete.addListener('place_changed', () => {
        // Do something with the selected place.
        this.zone.run(() => {
          const place: any = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) {
            console.error('Place not found');
            return;
          }
          this.lat = place.geometry.location.lat();
          this.lng = place.geometry.location.lng();
          this.map.setCenter(place.geometry.location);
          this.map.setZoom(18);
          this.marker.setPosition(place.geometry.location);
          this.marker.setVisible(true);
        });
      });
    });
  }

  onInputChange(): void {
    this.queryWait = true;
  }

  closeModal() {
    this.modalRef.dismiss();
  }

  send(){
    this.TransportService.emitLocationPicker({lat:this.lat,lng:this.lng});
    this.closeModal();
  }

  mapReadyHandler(map: any): void {
    this.map = map;
    this.setMarker();
    this.mapClickListener = this.map.addListener('click', (e: any) => {
        this.lat = e.latLng.lat();
        this.lng = e.latLng.lng();
        if (this.marker) {
            this.marker.setMap(null);
        }
        this.map.setZoom(18);
        this.setMarker();
    });
  }

  setMarker(){
    this.marker = new google.maps.Marker({
        position: { lat : this.lat, lng : this.lng },
        map: this.map,
        draggable: true
    });

    this.marker.addListener('dragend', () => {
        const newPosition = this.marker.getPosition();
        this.lat = newPosition.lat();
        this.lng = newPosition.lng();
    });
  }

  ngOnDestroy(): void {
    if (this.mapClickListener) {
      this.mapClickListener.remove();
    }
  }
}
