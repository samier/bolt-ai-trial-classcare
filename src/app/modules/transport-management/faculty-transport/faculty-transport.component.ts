import { Component } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from '../transport.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-faculty-transport',
  templateUrl: './faculty-transport.component.html',
  styleUrls: ['./faculty-transport.component.scss']
})
export class FacultyTransportComponent {

  constructor(
    private transportService: TransportService,
public CommonService: CommonService
  ) {}

  URLConstants = URLConstants;
  transport: any = [];

  ngOnInit(): void {
    this.fetchlist();
  }

  fetchlist(): void{
    this.transportService.getFacultyTransport().subscribe((res:any) => {  
      this.transport = res.data;  
    }); 
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

}
