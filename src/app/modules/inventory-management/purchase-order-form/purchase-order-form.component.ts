import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { DatePipe } from '@angular/common';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import * as moment from 'moment';
import { InventoryService } from '../inventory.service';
import { CommonService } from 'src/app/core/services/common.service';
import { discountType, incrementDecrement, requisitionStatus } from 'src/app/common-config/static-value';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'app-purchase-order-form',
  templateUrl: './purchase-order-form.component.html',
  styleUrls: ['./purchase-order-form.component.scss']
})
export class PurchaseOrderFormComponent {
  //#region Public | Private Variables
  itemTypeList: any;
  itemList: any;
  inventoryItemList: any = [];
  vendorTypeList: any;
  measurementTypeList: any;
  paymentTypeList: any;
  record_id: any = 0;
  userList: any;
  edit_view: any = false;
  poForm: FormGroup = new FormGroup({});
  URLConstants = URLConstants;

  states: any = [];
  allCities: any = [];
  cities: any = [];
  requisitionList: any = []
  paymentStatus = requisitionStatus

  file: any = null
  file_name: any = null

  discount_type = discountType
  requisition_disabled: any = [];
  gst: any = [];
  igst: any = [];

  calculationDetails: any = []
  totalCalculation: any = []
  disable_requisition: boolean = false;
  incrementDecrement: any = incrementDecrement

  editorConfig = this.CommonService.editorConfig()
  payment_terms: any = null
  requisition_title = null;

  is_saving:boolean = false;


  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  constructor(
    private inventorySerivce: InventoryService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private toastr: Toastr,
    public CommonService: CommonService
  ) {
    this.record_id = this.route.snapshot.paramMap.get('id');

  }


  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit() {
    this.initForm();
    this.getUserList();
    this.getStatesAndCities();
    this.getVendorTypeList();
    this.getPaymentTypeList();
    if (this.record_id != null && this.record_id != '' && this.record_id != 0) {
      this.edit_view = true;
      this.inventorySerivce.getPurchaseOrderDetail(this.record_id).subscribe((res: any) => {
        if (res.status == false) {
          this.toastr.showError(res.message);
        } else {
          this.getRequsitionList(res.data.vendor_id)
          this.getItemTypeList(res.data.vendor_id)
          let data = res.data
          this.requisition_title = data.requisition_title ?? "-"
          let purchase_order_details = res.data.purchase_order_details
          delete (data.purchase_order_details)
          delete (data.attachment)
          delete (data.requisition_title)
          data.purchase_by = parseInt(data.purchase_by)
          data.state = parseInt(data.state)
          data.city = parseInt(data.city)
          data.payment_option = parseInt(data.payment_option)
          if (data.requisition_id) {
            parseInt(data.payment_option)
          } else {
            this.disable_requisition = true;
          }

          this.poForm.controls['record_id'].setValue(res.data.id);
          this.poForm.patchValue(data)


          this.igst = []
          this.gst = []
          for (let i = 0; i < purchase_order_details.length; i++) {
            this.inventoryItemList[i] = purchase_order_details[i].itemList.map((el: any) => {
              return { id: el.id, name: el.item_name }
            });
            let item = this.fb.group({
              record_id: purchase_order_details[i].id,
              inventory_item_type_id: new FormControl(purchase_order_details[i].item.inventory_item_type_id),
              inventory_item_id: new FormControl(purchase_order_details[i].inventory_item_id),
              unit_purchase_price: new FormControl(purchase_order_details[i].item.unit_purchase_price),
              quantity: new FormControl(purchase_order_details[i].quantity),
              amount: new FormControl(purchase_order_details[i].amount),
              discount: new FormControl(purchase_order_details[i].discount),
              discount_type: new FormControl(purchase_order_details[i].discount_type),
              cgst: new FormControl(purchase_order_details[i].cgst),
              sgst: new FormControl(purchase_order_details[i].sgst),
              igst: new FormControl(purchase_order_details[i].igst),
              item_amount: new FormControl(purchase_order_details[i].grand_total),
              grand_total: new FormControl(purchase_order_details[i].grand_total),
            });
            this.quantities.push(item);
            this.igst[i] = purchase_order_details[i].cgst > 0 || purchase_order_details[i].sgst > 0;
            this.gst[i] = purchase_order_details[i].igst > 0 ? true : false;
            this.updateAmount(i)
          }
          this.handleAdjAmountChange()
        }
      }, (err: any) => {
        this.toastr.showError(err.error.message);
      });
    } else {
      this.getPurchaseOrderNo()
    }
  }



  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }
  newQuantity(): FormGroup {
    return this.fb.group({
      record_id: new FormControl(''),
      inventory_item_type_id: new FormControl(null, [Validators.required]),
      inventory_item_id: new FormControl(null, [Validators.required]),
      unit_purchase_price: new FormControl('', [Validators.required]),
      quantity: new FormControl('', [Validators.required, Validators.min(1)]),
      amount: new FormControl(''),
      discount: new FormControl(''),
      discount_type: new FormControl('amount'),
      discount_amount: new FormControl(''),
      cgst: new FormControl(''),
      sgst: new FormControl(''),
      igst: new FormControl(''),
      item_amount: new FormControl(''),
      grand_total: new FormControl(''),
    })
  }

  addQuantity() {
    this.disable_requisition = true;
    this.quantities.push(this.newQuantity());
  }

  removeQuantity(i: number) {
    this.quantities.removeAt(i);
    this.updateAmount(i)

    for (let j = 0; j < this.quantities.controls.length; j++) {
      this.updateAmount(j)
    }
    if (this.quantities.controls.length == 0) {
      this.disable_requisition = false
    }
  }

  getPurchaseOrderNo() {
    this.inventorySerivce.getPurchaseOrderNo().subscribe((resp: any) => {
      this.poForm.controls['purchase_order_no'].setValue(resp.data)
    })
  }

  getUserList() {
    this.inventorySerivce.getUserList().subscribe((res: any) => {
      if (res.status == false) {
        this.toastr.showError(res.message);
      } else {
        this.userList = res.data.map((item: any) => {
          return { id: item.id, name: item.full_name };
        });
      }
    }, (err: any) => {
      this.toastr.showError(err.error.message);
    });
  }

  getStatesAndCities() {
    this.inventorySerivce.getStatesAndCities().subscribe((res: any) => {
      if (res.status == false) {
        this.toastr.showError(res.message);
      } else {
        this.states = res.data.states;
        this.allCities = res.data.cities;
        this.cities = res.data.cities;
      }
    }, (err: any) => {
      this.toastr.showError(err.error.message);
    });
  }

  handleStateChange(value: any) {
    this.poForm.controls['city'].setValue(null);
    let countryId = value.id;
    this.cities = this.allCities.filter((city: any) => city.state_id == countryId);

  }

  handleVendorChange(event: any) {
    this.poForm.controls['requisition_id'].setValue(null)
    const quantities = this.poForm.get('quantities') as FormArray;
    this.requisition_disabled = [];
    quantities.clear();
    this.inventoryItemList = [];
    this.getRequsitionList(event.id)
    this.getItemTypeList(event.id)
  }


  getItemTypeList(id) {
    let data = {
      vendor_id: id
    }
    this.inventorySerivce.getItemTypeListByVendor(data).subscribe((res: any) => {
      if (res.status == false) {
        this.toastr.showError(res.message);
      } else {
        this.itemTypeList = res.data.inventory_item_types;
        this.itemList = res.data.inventory_items
      }
    }, (err: any) => {
      this.toastr.showError(err.error.message);
    });
  }

  getRequsitionList(id) {
    let data = {
      vendor_id: id
    }
    this.inventorySerivce.getRequsitionListByVendor(data).subscribe((resp: any) => {
      if (resp.status == false) {
        this.toastr.showError(resp.message);
      } else {
        this.requisitionList = resp.data;
      }
    }, (err: any) => {
      this.toastr.showError(err.error.message);
    });
  }

  getInventoryList() {
    this.inventorySerivce.getInventoryList().subscribe((res: any) => {
      if (res.status == false) {
        this.toastr.showError(res.message);
      } else {
        this.itemList = res.data;
      }
    }, (err: any) => {
      this.toastr.showError(err.error.message);
    });
  }


  getVendorTypeList() {
    this.inventorySerivce.getVendorTypeList().subscribe((res: any) => {
      if (res.status == false) {
        this.toastr.showError(res.message);
      } else {
        this.vendorTypeList = res.data.map((el: any) => {
          return { ...el, name: el.vendor_name }
        });
      }
    }, (err: any) => {
      this.toastr.showError(err.error.message);
    });
  }

  getPaymentTypeList() {
    this.inventorySerivce.getPaymentTypeList().subscribe((res: any) => {
      if (res.status == false) {
        this.toastr.showError(res.message);
      } else {
        this.paymentTypeList = res.data;
      }
    }, (err: any) => {
      this.toastr.showError(err.error.message);
    });
  }

  onSubmit() {
    if (this.quantities.controls.length == 0) {
      return this.toastr.showInfo('Please select requisition or add items', 'INFO');
    }
    this.is_saving = true;
    this.poForm.value.attachment = { base64: this.file, file_name: this.file_name };
    const payload = this.poForm.value;
    this.addPurchaseOrder(payload);
    return 0;
  }

  addPurchaseOrder(payload: any) {
    let record_id = this.poForm.controls['record_id'].value;
    this.inventorySerivce.addPO(payload, record_id).subscribe((res: any) => {
      if (res.status == false) {
        this.toastr.showError(res.message);
      } else {
        this.toastr.showSuccess(res.message);
        this.router.navigate([this.CommonService.setUrl(URLConstants.PURCHASE_ORDER_LIST)]);
      }
      this.is_saving = false;
    }, (err: any) => {
      this.toastr.showError(err.error.message);
      this.is_saving = false;
    });
  }


  changeFn(selectedItem: any) {
    this.inventorySerivce.getRequisitionDetail(selectedItem.id).subscribe((res: any) => {
      if (res.status == false) {
        this.toastr.showError(res.message);
      } else {
        this.igst = []
        this.gst = []
        // clear requisition item area         
        this.clearFormArray(this.poForm.get("quantities") as FormArray);

        // get requisition item information
        let s = res.data.requisition_item.length;
        let status = true;
        for (let i = 0; i < s; i++) {
          if (this.itemList.some(el => el.id == res.data.requisition_item[i].inventory_item_id)) {
            this.inventoryItemList[i] = res.data.requisition_item[i].itemList.map((el: any) => {
              return { id: el.id, name: el.item_name }
            });
            this.requisition_disabled[i] = true

            let h = this.fb.group({
              record_id: res.data.requisition_item[i].id,
              inventory_item_type_id: new FormControl(res.data.requisition_item[i].item_name.inventory_item_type_id),
              inventory_item_id: new FormControl(res.data.requisition_item[i].inventory_item_id),
              unit_purchase_price: new FormControl(res.data.requisition_item[i].item_name.unit_purchase_price),
              quantity: new FormControl(res.data.requisition_item[i].quantity),
              amount: new FormControl((res.data.requisition_item[i].item_name.unit_purchase_price * res.data.requisition_item[i].quantity)),
              discount: new FormControl(''),
              discount_type: new FormControl('amount'),
              discount_amount: new FormControl(''),
              cgst: new FormControl('',),
              sgst: new FormControl('',),
              igst: new FormControl('',),
              item_amount: new FormControl((res.data.requisition_item[i].item_name.unit_purchase_price * res.data.requisition_item[i].quantity)),
              grand_total: new FormControl((res.data.requisition_item[i].item_name.unit_purchase_price * res.data.requisition_item[i].quantity)),
            });
            this.quantities.push(h);
            this.updateAmount(i)
          } else {
            status = false;
          }
        }

        if (status == false) {
          this.toastr.showInfo('Vendor is not selling some of the items form the current requisition', 'INFO');
        }

      }
    }, (err: any) => {
      this.toastr.showError(err.error.message);
    });

    // set requision item information
  }

  itemTypeChange(event: any, i: any) {
    this.fieldsAsFormArray.controls?.[i]?.controls?.inventory_item_id.setValue(null);
    this.inventorySerivce.fetchItemList(event.id).subscribe((res: any) => {
      if (res.status == false) {
        this.toastr.showError(res.message);
      } else {
        this.inventoryItemList[i] = res.data.map((el: any) => {
          return { ...el, name: el.item_name }
        });
        this.fieldsAsFormArray.controls?.[i]?.controls?.inventory_item_id.reset();
      }
    }, (err: any) => {
      this.toastr.showError(err.error.message);
    });
  }

  itemChange(event: any, i: any) {
    let unit_purchase_price = event.unit_purchase_price;
    this.fieldsAsFormArray.controls?.[i]?.controls?.unit_purchase_price.setValue(unit_purchase_price);

  }

  get fieldsAsFormArray(): any {
    return this.poForm.get('quantities') as FormArray;
  }

  get quantities(): FormArray {
    return this.poForm.get("quantities") as FormArray
  }

  getAmount(i: any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.amount;
  }
  getDiscount(i: any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.discount;
  }

  getTaxAmount(i: any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.tax_amount;
  }

  getQuantity(i: any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.quantity;
  }

  getItemAmount(i: any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.item_amount;
  }

  getGrandTotal(i: any): any {
    return this.fieldsAsFormArray.controls?.[i]?.controls?.grand_total;
  }

  updateAmount(i: any) {
    let amount = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.unit_purchase_price.value);
    let item_amount = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.amount.value);
    let discount = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.discount.value);
    let discount_type = this.fieldsAsFormArray.controls?.[i]?.controls.discount_type.value;
    let cgst = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.cgst.value);
    let sgst = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.sgst.value);
    let igst = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.igst.value);
    let quantity = parseFloat(this.fieldsAsFormArray.controls?.[i]?.controls.quantity.value);


    if (isNaN(quantity)) {
      quantity = 0;
    }
    if (isNaN(cgst)) {
      cgst = 0;
    }
    if (isNaN(sgst)) {
      sgst = 0;
    }
    if (isNaN(igst)) {
      igst = 0;
    }
    if (isNaN(discount)) {
      discount = 0;
    }
    if (isNaN(amount)) {
      amount = 0;
    }

    this.igst[i] = cgst > 0 || sgst > 0;
    this.gst[i] = igst > 0 ? true : false;

    amount = (amount * quantity);

    this.fieldsAsFormArray.controls?.[i]?.controls.amount.setValue(amount);

    let discount_amount = 0
    if (discount_type == 'amount') {
      discount_amount = discount;
    } else {
      discount_amount = (amount * discount) / 100;
    }
    if (discount_amount > amount) {
      this.fieldsAsFormArray.controls?.[i]?.controls.grand_total.setValue(amount);
      this.fieldsAsFormArray.controls?.[i]?.controls.discount.setValue(null);
      return this.toastr.showError('Discont amount must be less then total amount');
    }
    amount = amount - discount_amount;

    let cgstTax = (amount * cgst) / 100;
    let sgstTax = (amount * sgst) / 100;
    let igstTax = (amount * igst) / 100;
    amount = amount + cgstTax + sgstTax + igstTax;

    const calculation = {
      sub_total: item_amount,
      grand_total: amount,
      discount_total: discount_amount,
      cgst: cgstTax,
      sgst: sgstTax,
      igst: igstTax,
    };

    this.calculationDetails[i] = calculation;

    this.totalCalculation = this.calculationDetails.reduce((acc: any, element: any) => ({
      sub_total: acc.sub_total + (element.sub_total || 0),
      grand_total: acc.grand_total + (element.grand_total || 0),
      discount_total: acc.discount_total + (element.discount_total || 0),
      cgst: acc.cgst + (element.cgst || 0),
      sgst: acc.sgst + (element.sgst || 0),
      igst: acc.igst + (element.igst || 0),
    }), {
      sub_total: 0,
      grand_total: 0,
      discount_total: 0,
      cgst: 0,
      sgst: 0,
      igst: 0
    });

    this.poForm.patchValue({
      sub_total: this.totalCalculation.sub_total,
      discount_total: this.totalCalculation.discount_total,
      taxable_amount: this.totalCalculation.sub_total - this.totalCalculation.discount_total,
      cgst_amount: this.totalCalculation.cgst,
      sgst_amount: this.totalCalculation.sgst,
      igst_amount: this.totalCalculation.igst,
      total_amount: this.totalCalculation.grand_total,
    });


    this.fieldsAsFormArray.controls?.[i]?.controls.grand_total.setValue(amount);
    this.handleAdjAmountChange()
  }

  handleAdjAmountChange() {
    let taxable_amount = this.poForm.controls['taxable_amount'].value
    let cgst_amount = this.poForm.controls['cgst_amount'].value
    let sgst_amount = this.poForm.controls['sgst_amount'].value
    let igst_amount = this.poForm.controls['igst_amount'].value

    let amount_before_adjustment = (parseFloat(taxable_amount) + parseFloat(cgst_amount) + parseFloat(sgst_amount) + parseFloat(igst_amount))


    let adj_amount = this.poForm.controls['adjustment_amount'].value
    let adj_type = this.poForm.controls['adjustment_type'].value

    if (adj_amount == null || adj_amount == "") {
      adj_amount = 0
    }


    let amount_after_adjustment = 0;
    if (adj_type == 'increment') {
      amount_after_adjustment = amount_before_adjustment + parseFloat(adj_amount)
    } else {
      amount_after_adjustment = amount_before_adjustment - parseFloat(adj_amount)
    }


    this.poForm.controls['total_amount'].setValue(amount_after_adjustment)

  }


  onFileChange(event: any) {
    this.file = event.target.files[0];
    this.file_name = this.file.name;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const image64 = e.target?.result as string; // Base64 string
      this.file = image64;
    };

    reader.readAsDataURL(this.file);
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.poForm = new FormGroup({
      purchase_order_no: new FormControl('', [Validators.required]),
      purchase_order_date: new FormControl('', [Validators.required]),
      purchase_by: new FormControl(null, [Validators.required]),
      address: new FormControl('', [Validators.required]),
      state: new FormControl(null, [Validators.required]),
      city: new FormControl(null, [Validators.required]),
      pincode: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone_no: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
      delivery_date: new FormControl('', [Validators.required]),
      attachment: new FormControl(''),
      vendor_id: new FormControl(null, [Validators.required]),
      requisition_id: new FormControl(null),
      payment_option: new FormControl(null, [Validators.required]),
      payment_status: new FormControl('0', [Validators.required]),
      payment_terms: new FormControl('', [Validators.required]),
      quantities: this.fb.array([]),
      sub_total: new FormControl(''),
      discount_total: new FormControl(''),
      adjustment_amount: new FormControl('0'),
      adjustment_type: new FormControl('increment'),
      taxable_amount: new FormControl(''),
      cgst_amount: new FormControl(''),
      sgst_amount: new FormControl(''),
      igst_amount: new FormControl(''),
      total_amount: new FormControl(''),
      record_id: new FormControl(''),
    });
  }
}
