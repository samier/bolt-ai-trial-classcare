import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { HostelManagementService } from '../../hostel-management.service';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-wing',
  templateUrl: './create-wing.component.html',
  styleUrls: ['./create-wing.component.scss']
})
export class CreateWingComponent implements OnInit {

  @ViewChild('createwingMdl') createwingMdl: ElementRef | undefined;
  @Output() reloadWings = new EventEmitter<void>();
  @Input() wing: any;
  constructor(
    private HostelManagementService: HostelManagementService,
    private toastr: Toastr,
    private modalService: NgbModal,
  ) { }
  validationError: any = [];
  hostels: any = [];
  params = {
    wing_id: null,
    hostel_id: null,
    name: null
  };
  ngOnInit(): void {
    this.HostelManagementService.getHostelDropdownList().subscribe(
      (resp: any) => {
        this.hostels = resp.data;
        this.params.wing_id = this.wing.id
        this.params.hostel_id = this.wing.hostel_id
      }
    );
    this.params.name = this.wing.name
  }

  submit() {
    console.log(this.params);

    this.HostelManagementService.createWingDetail(this.params).subscribe(
      (resp: any) => {
        console.log(resp);

        if (resp.status) {
          this.toastr.showSuccess(resp.message);
          this.clearForm();
          this.modalService.dismissAll();
          this.reloadWings.emit();
        } else {
          this.validationError = resp.error
          this.toastr.showError(resp.message)
        }
      }
    );
  }

  close() {
    this.modalService.dismissAll()
    this.clearForm()
  }

  clearForm() {
    this.params = {
      wing_id: null,
      hostel_id: null,
      name: null
    };
  }

}
