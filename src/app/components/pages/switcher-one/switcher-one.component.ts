import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavService } from 'src/app/shared/services/nav.service';
import { SwitcherService } from 'src/app/shared/services/switcher.service';
import * as switcher from '../../../shared/componets/switcher/switcher'
import * as sidebarFn from '../../../shared/componets/sidemenu/sidemenu'
@Component({
  selector: 'app-switcher-one',
  templateUrl: './switcher-one.component.html',
  styleUrls: ['./switcher-one.component.scss']
})
export class SwitcherOneComponent implements OnInit {
 
  lightMenu: any = document.querySelector('#myonoffswitch3');
  colorMenu: any = document.querySelector('#myonoffswitch4');
  darkMenu: any = document.querySelector('#myonoffswitch5');
  gradientMenu: any = document.querySelector('#myonoffswitch25');
  lightHeader: any = document.querySelector('#myonoffswitch6');
  darkHeader: any = document.querySelector('#myonoffswitch8');
  gradientHeader: any = document.querySelector('#myonoffswitch26');
  colorHeader: any = document.querySelector('#myonoffswitch7');

 body = document.querySelector('body');

 
 constructor(public navServices: NavService) {  }
 ngOnInit(): void {
   switcher.localStorageBackUp();
   switcher.customClickFn();
   switcher.updateChanges();
 }
 reset(){
 let lightBtn = document.getElementById('myonoffswitch1') as HTMLInputElement;
   localStorage.clear()
   sessionStorage.clear(); 
   let html:any = document.querySelector('html')
   let body = document.querySelector('body')
   html.style = ''; 
   body?.classList.remove('dark-theme');
   body?.classList.remove('transparent-theme');
   body?.classList.remove('light-header');
   body?.classList.remove('dark-header');
   body?.classList.remove('color-header');
   body?.classList.remove('gradient-header');
   body?.classList.remove('light-menu');
   body?.classList.remove('color-menu');
   body?.classList.remove('dark-menu');
   body?.classList.remove('gradient-menu');
   body?.classList.remove('layout-boxed');
   body?.classList.remove('scrollable-layout');
   body?.classList.remove('bg-img1');
   body?.classList.remove('bg-img2');
   body?.classList.remove('bg-img3');
   body?.classList.remove('bg-img4');
   body?.classList.remove("body-style1");
   body?.classList.remove("horizontal");
   body?.classList.remove("rtl");
   lightBtn.checked = true
   html?.setAttribute('dir', 'ltr');
   document.querySelector('#style')?.setAttribute( 'href', './assets/bootstrap/bootstrap.css');
   sidebarFn.checkHoriMenu();
   body?.classList.add("sidebar-mini");
   document.querySelector(".app-sidebar")?.classList.remove("horizontal-main");
   document.querySelector(".main-sidemenu")?.classList.remove("container");
   document.querySelector(".main-content")?.classList.remove("horizontal-content");
   document.querySelector(".main-content")?.classList.add("app-content");
   document.querySelectorAll('.main-container').forEach((e,i)=>{
     e?.classList.add('container-fluid');
   });
   document.querySelectorAll('.main-container').forEach((e,i)=>{
     e?.classList.remove('container');
   });
   document.querySelector('.main-header')?.classList.add('side-header');
   document.querySelector('.main-header')?.classList.remove('hor-header');
   body?.classList.remove("leftbgimage1","leftbgimage2","leftbgimage3","leftbgimage4","leftbgimage5");
   switcher.updateChanges();
   switcher.checkOptions();
   let primaryColorVal = getComputedStyle(document.documentElement).getPropertyValue('--primary-bg-color').trim();
   
   document.querySelector('html')?.style.setProperty('--primary-bg-color', primaryColorVal);
 
 }

 public color1: string = '#0162e8';
 public color2: string = '#0162e8';
 public color3: string = '#0162e8';
 public color4: string = '#0162e8';
 public color5: string = '#0162e8';

 public dynamicLightPrimary(data: any): void {
   this.color1 = data.color;

   const dynamicPrimaryLight = document.querySelectorAll('input.color-primary-light');

   switcher.dynamicLightPrimaryColor(dynamicPrimaryLight, this.color1);
   
   sessionStorage.setItem('light-primary-color', this.color1);
   sessionStorage.setItem('light-primary-hover', this.color1);
   sessionStorage.setItem('light-primary-border', this.color1);
   let light = document.getElementById('myonoffswitch1') as HTMLInputElement;
   light.checked = true;

   // Adding
   this.body?.classList.add('light-theme');
   sessionStorage.setItem('LightTheme', 'true');
   
   // removing
   sessionStorage.removeItem('DarkTheme');
   sessionStorage.removeItem('TransparentTheme');
   this.body?.classList.remove('dark-theme');
   this.body?.classList.remove('transparent-theme');
   this.body?.classList.remove('bg-img1');
   this.body?.classList.remove('bg-img2');
   this.body?.classList.remove('bg-img3');
   this.body?.classList.remove('bg-img4');
   
   sessionStorage.removeItem('dark-primary-color');
   sessionStorage.removeItem('transparent-primary-color');
   sessionStorage.removeItem('transparent-bg-color');
   sessionStorage.removeItem('transparent-bgImg-primary-color');
   sessionStorage.removeItem('BgImage');
   switcher.checkOptions();
   switcher.updateChanges();
 }
 public dynamicDarkPrimary(data: any): void {
   this.color2 = data.color;

   const dynamicPrimaryDark = document.querySelectorAll('input.color-primary-dark');

   switcher.dynamicDarkPrimaryColor(dynamicPrimaryDark, this.color2);
   
   sessionStorage.setItem('dark-primary-color', this.color2);
   let dark = document.getElementById('myonoffswitch2') as HTMLInputElement;
   dark.checked = true;

   // Adding
   this.body?.classList.add('dark-theme');
   sessionStorage.setItem('DarkTheme', 'true');
   
   // removing
   sessionStorage.removeItem('LightTheme');
   sessionStorage.removeItem('TransparentTheme');
   this.body?.classList.remove('light-theme');
   this.body?.classList.remove('transparent-theme');
   this.body?.classList.remove('bg-img1');
   this.body?.classList.remove('bg-img2');
   this.body?.classList.remove('bg-img3');
   this.body?.classList.remove('bg-img4');    
   
   sessionStorage.removeItem('light-primary-color');
   sessionStorage.removeItem('light-primary-hover');
   sessionStorage.removeItem('light-primary-border');
   sessionStorage.removeItem('transparent-primary-color');
   sessionStorage.removeItem('transparent-bg-color');
   sessionStorage.removeItem('transparent-bgImg-primary-color');
   sessionStorage.removeItem('BgImage');
   switcher.checkOptions();
   switcher.updateChanges();
 }
 public dynamicTranparentPrimary(data: any): void {
   this.color3 = data.color;

   const dynamicPrimaryTrasnsparent = document.querySelectorAll('input.color-primary-transparent');

   switcher.dynamicTrasnsparentPrimaryColor(
     dynamicPrimaryTrasnsparent,
     this.color3
   );
   sessionStorage.setItem('transparent-primary-color', this.color3);
   let transparent = document.getElementById('myonoffswitchTransparent') as HTMLInputElement;
   transparent.checked = true;

   // Adding
   this.body?.classList.add('transparent-theme');
   sessionStorage.setItem('TransparentTheme', 'true');
   
   // Removing
   sessionStorage.removeItem('DarkTheme');
   sessionStorage.removeItem('LightTheme');
   this.body?.classList.remove('light-theme');
   this.body?.classList.remove('dark-theme');
   this.body?.classList.remove('bg-img1');
   this.body?.classList.remove('bg-img2');
   this.body?.classList.remove('bg-img3');
   this.body?.classList.remove('bg-img4'); 
   this.body?.classList.remove('light-header');
   this.body?.classList.remove('dark-header');
   this.body?.classList.remove('color-header');
   this.body?.classList.remove('gradient-header');
   this.body?.classList.remove('light-menu');
   this.body?.classList.remove('color-menu');
   this.body?.classList.remove('dark-menu');
   this.body?.classList.remove('gradient-menu');   

   sessionStorage.removeItem('light-primary-color');
   sessionStorage.removeItem('light-primary-hover');
   sessionStorage.removeItem('light-primary-border');
   sessionStorage.removeItem('dark-primary-color');
   sessionStorage.removeItem('transparent-bg-color');
   sessionStorage.removeItem('transparent-bgImg-primary-color');
   sessionStorage.removeItem('BgImage');
   switcher.removeForTransparent();
   switcher.updateChanges();
 }
 public dynamicTranparentBgPrimary(data: any): void {
   this.color4 = data.color;

   const dynamicPrimaryBgTrasnsparent = document.querySelectorAll('input.color-bg-transparent');

   switcher.dynamicBgTrasnsparentPrimaryColor(
     dynamicPrimaryBgTrasnsparent,
     this.color4
   );
   sessionStorage.setItem('transparent-bg-color', this.color4);
   let transparent = document.getElementById('myonoffswitchTransparent') as HTMLInputElement;
   transparent.checked = true;

   // Adding
   this.body?.classList.add('transparent-theme');
   sessionStorage.setItem('TransparentTheme', 'true');
   
   // Removing
   sessionStorage.removeItem('DarkTheme');
   sessionStorage.removeItem('LightTheme');
   this.body?.classList.remove('light-theme');
   this.body?.classList.remove('dark-theme');
   this.body?.classList.remove('bg-img1');
   this.body?.classList.remove('bg-img2');
   this.body?.classList.remove('bg-img3');
   this.body?.classList.remove('bg-img4'); 
   this.body?.classList.remove('light-header');
   this.body?.classList.remove('dark-header');
   this.body?.classList.remove('color-header');
   this.body?.classList.remove('gradient-header');
   this.body?.classList.remove('light-menu');
   this.body?.classList.remove('color-menu');
   this.body?.classList.remove('dark-menu');
   this.body?.classList.remove('gradient-menu');

   sessionStorage.removeItem('light-primary-color');
   sessionStorage.removeItem('light-primary-hover');
   sessionStorage.removeItem('light-primary-border');
   sessionStorage.removeItem('dark-primary-color');
   sessionStorage.removeItem('transparent-bgImg-primary-color');
   sessionStorage.removeItem('BgImage');
   switcher.removeForTransparent();
   switcher.updateChanges();
 }
 public dynamicTranparentImgPrimary(data: any): void {
   this.color5 = data.color;

   const dynamicPrimaryBgImgTrasnsparent = document.querySelectorAll('input.color-primary-transparent-img');

   switcher.dynamicBgImgTrasnsparentPrimaryColor(
     dynamicPrimaryBgImgTrasnsparent,
     this.color5
   );
   
   sessionStorage.setItem('transparent-bgImg-primary-color', this.color5);
   let transparent = document.getElementById('myonoffswitchTransparent') as HTMLInputElement;
   transparent.checked = true;

   if (
     document.querySelector('body')?.classList.contains('bg-img1') == false &&
     document.querySelector('body')?.classList.contains('bg-img2') == false &&
     document.querySelector('body')?.classList.contains('bg-img3') == false &&
     document.querySelector('body')?.classList.contains('bg-img4') == false
   ) {
     document.querySelector('body')?.classList.add('bg-img1');
     sessionStorage.setItem('BgImage', 'bg-img1');
   }
   // Adding
   this.body?.classList.add('transparent-theme');
   sessionStorage.setItem('TransparentTheme', 'true');
   
   // Removing
   sessionStorage.removeItem('DarkTheme');
   sessionStorage.removeItem('LightTheme');
   this.body?.classList.remove('light-theme');
   this.body?.classList.remove('dark-theme'); 
   this.body?.classList.remove('light-header');
   this.body?.classList.remove('dark-header');
   this.body?.classList.remove('color-header');
   this.body?.classList.remove('gradient-header');
   this.body?.classList.remove('light-menu');
   this.body?.classList.remove('color-menu');
   this.body?.classList.remove('dark-menu');
   this.body?.classList.remove('gradient-menu');

   sessionStorage.removeItem('light-primary-color');
   sessionStorage.removeItem('light-primary-hover');
   sessionStorage.removeItem('light-primary-border');
   sessionStorage.removeItem('dark-primary-color');
   sessionStorage.removeItem('transparent-primary-color');
   sessionStorage.removeItem('transparent-bg-color');
   switcher.removeForTransparent();
   switcher.updateChanges();
 }

 bgImage(e: any) {
   let transparent = document.getElementById('myonoffswitchTransparent') as HTMLInputElement;
   transparent.checked = true;

   let img = e.parentElement.classList[0];
   sessionStorage.setItem('BgImage', img);
   // this.body?.classList.add(img);
   let allImg = document.querySelectorAll('.bg-img');
   allImg.forEach((el, i) => {
     let ele = el.classList[0];
     this.body?.classList.remove(ele);
     this.body?.classList.add(img);
   });

   // Adding
   this.body?.classList.add('transparent-theme');
   sessionStorage.setItem('TransparentTheme', 'true');
   
   // Removing
   sessionStorage.removeItem('DarkTheme');
   sessionStorage.removeItem('LightTheme');
   this.body?.classList.remove('light-theme');
   this.body?.classList.remove('dark-theme'); 
   this.body?.classList.remove('light-header');
   this.body?.classList.remove('dark-header');
   this.body?.classList.remove('color-header');
   this.body?.classList.remove('gradient-header');
   this.body?.classList.remove('light-menu');
   this.body?.classList.remove('color-menu');
   this.body?.classList.remove('dark-menu');
   this.body?.classList.remove('gradient-menu');
   sessionStorage.removeItem('light-primary-color');
   sessionStorage.removeItem('light-primary-hover');
   sessionStorage.removeItem('light-primary-border');
   sessionStorage.removeItem('dark-primary-color');
   sessionStorage.removeItem('transparent-primary-color');
   sessionStorage.removeItem('transparent-bg-color');
   switcher.removeForTransparent();
   switcher.updateChanges();
   
 }



 leftmenuBg(image:any){
   switch (image) {
     case "leftbgimage1":
       document.body.classList.add("leftbgimage1")
       document.body.classList.remove("leftbgimage2","leftbgimage3","leftbgimage4","leftbgimage5")
       break;
       
     case "leftbgimage2":
       document.body.classList.add("leftbgimage2")
       document.body.classList.remove("leftbgimage1","leftbgimage3","leftbgimage4","leftbgimage5")
       break;

     case "leftbgimage3":
       document.body.classList.add("leftbgimage3")
       document.body.classList.remove("leftbgimage2","leftbgimage1","leftbgimage4","leftbgimage5")
       break;

     case "leftbgimage4":
       document.body.classList.add("leftbgimage4")
       document.body.classList.remove("leftbgimage2","leftbgimage3","leftbgimage1","leftbgimage5")
       break;

     case "leftbgimage5":
       document.body.classList.add("leftbgimage5")
       document.body.classList.remove("leftbgimage2","leftbgimage3","leftbgimage4","leftbgimage1")
       break;

     default:
       document.body.classList.add("leftbgimage1")
       document.body.classList.remove("leftbgimage2","leftbgimage3","leftbgimage4","leftbgimage5");
       break;
   }
 }

 defaultBody(){
   document.body.classList.remove("body-style1")
 }
 
 bodyStyle(){
   document.body.classList.add("body-style1")
 }

 Horizantal(){
   localStorage.clear()
   localStorage.setItem("ValexHorizantal","true")
   // document.querySelector(".badgeDisplayShow")?.classList.add("badgedisplay")
   
 }
 VerticalMenu(){
   localStorage.clear()

 }
 HorizantalHover(){
   localStorage.clear()
   localStorage.setItem("ValexHorizantalHover","true")
 }

 RTL(){
   document.body.classList.add("rtl")
   document.body.classList.remove("ltr")
   localStorage.removeItem("ltr")
   localStorage.setItem("Rtl","true")
 }

 LTR(){
   document.body.classList.add("ltr")
   document.body.classList.remove("rtl")
   localStorage.removeItem("Rtl")
   localStorage.setItem("ltr","true")
 }
}
