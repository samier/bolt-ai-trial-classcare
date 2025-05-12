import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FileimportService } from 'src/app/modules/excel-import/fileimport.service';

@Component({
  selector: 'app-fees',
  templateUrl: './fees.component.html',
  styleUrls: ['./fees.component.scss']
})
export class FeesComponent implements OnInit {
  importform: FormGroup = new FormGroup({
    fee_type: new FormControl(''),
    file: new FormControl(''),
  });
  urld: any = window.location.origin + '/public/download/sample.xlsx';
  typeOfFees = [
    { id: 'paid', name: 'Paid Fees' },
    { id: 'paid_fees_update_reference_no', name: 'Paid Fees Update Reference No' },
    { id: 'discount', name: 'Discount Fees' },
    { id: 'refund', name: 'Refund Fees' },
    { id: 'refund_fees_update_reference_no', name: 'Refund Fees Update Reference No' },
    { id: 'cancel_receipt', name: 'Cancel Receipt' },
    { id: 'delete_receipt', name: 'Delete Receipt' },
    { id: 'assign_transport', name: 'Assign Transport' },
    { id: 'wallet_import', name: 'Wallet History Import' },
  ]
  return_result: any = false;
  failed_rows: any = [];
  filedata: any;
  selectedFeeType = null
  isUploading: boolean = false
  constructor(private fileImportService: FileimportService, private toastr: Toastr, public commonService: CommonService) { }

  ngOnInit(): void {

  }


  onFileChange(event: any) {
    this.filedata = event.target.files[0];;
  }


  onSubmit() {
    const formData = new FormData();

    formData.append('file', this.filedata);
    formData.append('fee_type', this.selectedFeeType !== null ? this.selectedFeeType : '');
    this.isUploading = true
    this.fileImportService.submitFeeTypeFile(this.selectedFeeType, formData).subscribe((res: any) => {
      this.isUploading = false
      if (res.status == false) {
        this.toastr.showError(res.message);
      } else {
        //this.importform.set('')
        this.importform.reset();
        this.selectedFeeType = null
        this.toastr.showSuccess(res.message);
      }
    }, (err: any) => {
      this.isUploading = false
      this.toastr.showError(err.error.message);
    });
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem('branch') + '/' + url;
  }
}
