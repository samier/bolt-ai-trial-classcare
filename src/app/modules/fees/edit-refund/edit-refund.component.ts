import { Component, OnInit} from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Component({
  selector: 'app-edit-refund',
  templateUrl: './edit-refund.component.html',
  styleUrls: ['./edit-refund.component.scss']
})
export class EditRefundComponent implements OnInit{
  URLConstants = URLConstants;
  selectedItems:any = [];
  Authority: any = [
    {id:1,name:"Authority 1"},
    {id:2,name:"Authority 2"},
    {id:3,name:"Authority 3"},
  ];
  ngOnInit() {
    this.selectedItems = [
    ];    
  }

  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
}
