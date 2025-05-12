import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavService } from '../../services/nav.service';
import { SwitcherService } from '../../services/switcher.service';
import * as switcher from './switcher';
import * as sidebarFn from '../sidemenu/sidemenu'
import { HttpClient } from '@angular/common/http';
import { enviroment } from 'src/environments/environment.staging';
import { LoaderService } from 'src/app/core/services/loader-service';

@Component({
  selector: 'app-switcher',
  templateUrl: './switcher.component.html',
  styleUrls: ['./switcher.component.scss']
})
export class SwitcherComponent implements OnInit {

   lightMenu: any = document.querySelector('#myonoffswitch3');
   colorMenu: any = document.querySelector('#myonoffswitch4');
   darkMenu: any = document.querySelector('#myonoffswitch5');
   gradientMenu: any = document.querySelector('#myonoffswitch25');
   lightHeader: any = document.querySelector('#myonoffswitch6');
   darkHeader: any = document.querySelector('#myonoffswitch8');
   gradientHeader: any = document.querySelector('#myonoffswitch26');
   colorHeader: any = document.querySelector('#myonoffswitch7');

  layoutSub: Subscription;

  body = document.querySelector('body');
  showSideMenuLayout = true;
  private API_URL = enviroment.apiUrl;

  @ViewChild('switcher', { static: false }) switcher!: ElementRef;
  constructor(
    public renderer: Renderer2,
    public switcherServic: SwitcherService,
    public navServices: NavService,
    public httpRequest: HttpClient,
    public LoaderService: LoaderService,

  ) {
    this.layoutSub = switcherServic.changeEmitted.subscribe((value) => {
      // console.log(value);

      if (value) {
        this.renderer.addClass(this.switcher.nativeElement.firstElementChild,'active');
        this.renderer.setStyle(this.switcher.nativeElement.firstElementChild,'right','0px');
        value = true;
      } else {
        this.renderer.removeClass(this.switcher.nativeElement.firstElementChild,'active');
        this.renderer.setStyle(this.switcher.nativeElement.firstElementChild,'right','-270px');
        value = false;
      }
    });
  }
  ngOnInit(): void {
    this.showSideMenuLayout =  sessionStorage.getItem('hor_click_menu') || sessionStorage.getItem('hor_hover_menu') || sessionStorage.getItem('hor_verti_menu') ? false : true
    this.LoaderService.setLoading(true);
    // switcher.localStorageBackUp();
    this.getSwicherValue()
    // switcher.localStorageBackUp();
    switcher.customClickFn();
    // switcher.updateChanges();
    switcher.checkOptions();
  }

  getSwicherValue () {
    this.httpRequest.post(this.API_URL+'api/switcher-menu/get', null).subscribe((resp:any) => {
      if(resp.status && resp.data != null){
        sessionStorage.clear()
        for (const key in resp.data) {
          if (resp.data.hasOwnProperty(key) && resp.data[key] === 1) {
              sessionStorage.setItem(key, 'true')
          }
        }
      this.color1 = resp.data['primary_color']
      sessionStorage.setItem('primary_color',resp.data['primary_color'] )
      sessionStorage.setItem('primary_hover_color',resp.data['primary_hover_color'] )
      sessionStorage.setItem('primary_border_color',resp.data['primary_border_color'] )
      sessionStorage.setItem('background_color',resp.data['background_color'] )
      sessionStorage.setItem('theme_color',resp.data['theme_color'] )
      switcher.localStorageBackUp();
      this.LoaderService.setLoading(false);
    }else {
      this.reset()
    }
    if(resp.status && resp.data == null){
      this.LoaderService.setLoading(false);
    }
    });
  }

  updateSwitcher(value:any){
    this.httpRequest.post(this.API_URL+'api/switcher-menu/update', value).subscribe()
  }
  reset(){
  let lightBtn = document.getElementById('myonoffswitch1') as HTMLInputElement;
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
    body?.classList.remove("default-mennu");
    body?.classList.add("sidenav-toggled");
    lightBtn.checked = true
    html?.setAttribute('dir', 'ltr');
    document.querySelector('#style')?.setAttribute( 'href', './assets/bootstrap/bootstrap.css');
    sidebarFn.checkHoriMenu();
    body?.classList.add("sidebar-mini");
    body?.classList.add("sideicon-menu");
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

    //left menu style
    let light = document.getElementById('myonoffswitch3') as HTMLInputElement;
    light.checked = true;
    let icon_overly = document.getElementById('myonoffswitch15') as HTMLInputElement;
    icon_overly.checked = true;
    body?.classList.add('light-menu');
    this.color1 = '#01329C'
    sessionStorage.setItem('primary_color',this.color1 )
      sessionStorage.setItem('primary_hover_color','#f2872695' )
      sessionStorage.setItem('primary_border_color',this.color1 )
      sessionStorage.setItem('background_color','#141b2ddd' )
      sessionStorage.setItem('theme_color','#141b2d' )
      sessionStorage.setItem('hor_verti_menu',"true" )
    //reset database values
    this.updateSwitcher({
      rtl: false,
      ltr:true,
      // vertical_menu: false,
      hor_verti_menu: true,
      hor_click_menu: false,
      hor_hover_menu: false,
      light_theme : true,
      dark_theme : false,
      primary_color : this.color1,
      primary_hover_color: '#f2872695',
      primary_border_color: this.color1,
      background_color: '#141b2ddd',
      theme_color: '#141b2d',
      light_menu: true,
      color_menu: false,
      dark_menu: false,
      gradient_menu: false,
      light_header: true,
      color_header: false,
      dark_header: false,
      gradient_header: false,
      default_body: true,
      body_style: false,
      full_width: true,
      boxed: false,
      fixed: true,
      scrollable: false,default_menu: false, closed_menu: false, icon_with_text: false, icon_overlay: true, hover_submenu: false, hover_submenu_style: false, double_menu: false, double_menu_tabs: false
    })
    switcher.localStorageBackUp();
  }

  public color1: string|any = '#01329C';
  public color2: string = '#0162e8';
  public color3: string = '#0162e8';
  public color4: string = '#0162e8';
  public color5: string = '#0162e8';

  public dynamicLightPrimary(data: any): void {
    this.color1 = data.color;

    const dynamicPrimaryLight = document.querySelectorAll('input.color-primary-light');

    switcher.dynamicLightPrimaryColor(dynamicPrimaryLight, this.color1, this.color1 + 95);

    sessionStorage.setItem('primary_color', this.color1);
    sessionStorage.setItem('primary_hover_color', this.color1 + 95);
    sessionStorage.setItem('primary_border_color', this.color1);
    this.updateSwitcher({
      primary_color : this.color1,
      primary_hover_color: this.color1 + 95,
      primary_border_color: this.color1})
    // let light = document.getElementById('myonoffswitch1') as HTMLInputElement;
    // light.checked = true;

    // // Adding
    // this.body?.classList.add('light-theme');
    // sessionStorage.setItem('valexLightTheme', 'true');

    // // removing
    // sessionStorage.removeItem('valexDarkTheme');
    // sessionStorage.removeItem('valexTransparentTheme');
    // this.body?.classList.remove('dark-theme');
    // this.body?.classList.remove('transparent-theme');
    // this.body?.classList.remove('bg-img1');
    // this.body?.classList.remove('bg-img2');
    // this.body?.classList.remove('bg-img3');
    // this.body?.classList.remove('bg-img4');

    // sessionStorage.removeItem('valexdark-primary-color');
    // sessionStorage.removeItem('valextransparent-primary-color');
    // sessionStorage.removeItem('valextransparent-bg-color');
    // sessionStorage.removeItem('valextransparent-bgImg-primary-color');
    // sessionStorage.removeItem('valexBgImage');
    // switcher.checkOptions();
    // switcher.updateChanges();
  }
  public dynamicDarkPrimary(data: any): void {
    this.color2 = data.color;

    const dynamicPrimaryDark = document.querySelectorAll('input.color-primary-dark');

    switcher.dynamicDarkPrimaryColor(dynamicPrimaryDark, this.color2);

    sessionStorage.setItem('valexdark-primary-color', this.color2);
    let dark = document.getElementById('myonoffswitch2') as HTMLInputElement;
    dark.checked = true;

    // Adding
    this.body?.classList.add('dark-theme');
    sessionStorage.setItem('dark_theme', 'true');

    // removing
    sessionStorage.removeItem('light_theme');
    sessionStorage.removeItem('valexTransparentTheme');
    this.body?.classList.remove('light-theme');
    this.body?.classList.remove('transparent-theme');
    this.body?.classList.remove('bg-img1');
    this.body?.classList.remove('bg-img2');
    this.body?.classList.remove('bg-img3');
    this.body?.classList.remove('bg-img4');

    sessionStorage.removeItem('primary_color');
    sessionStorage.removeItem('primary_hover_color');
    sessionStorage.removeItem('primary_border_color');
    sessionStorage.removeItem('valextransparent-primary-color');
    sessionStorage.removeItem('valextransparent-bg-color');
    sessionStorage.removeItem('valextransparent-bgImg-primary-color');
    sessionStorage.removeItem('valexBgImage');
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
    sessionStorage.setItem('valextransparent-primary-color', this.color3);
    let transparent = document.getElementById('myonoffswitchTransparent') as HTMLInputElement;
    transparent.checked = true;

    // Adding
    this.body?.classList.add('transparent-theme');
    sessionStorage.setItem('valexTransparentTheme', 'true');

    // Removing
    sessionStorage.removeItem('dark_theme');
    sessionStorage.removeItem('light_theme');
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

    sessionStorage.removeItem('primary_color');
    sessionStorage.removeItem('primary_hover_color');
    sessionStorage.removeItem('primary_border_color');
    sessionStorage.removeItem('valexdark-primary-color');
    sessionStorage.removeItem('valextransparent-bg-color');
    sessionStorage.removeItem('valextransparent-bgImg-primary-color');
    sessionStorage.removeItem('valexBgImage');
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
    sessionStorage.setItem('valextransparent-bg-color', this.color4);
    let transparent = document.getElementById('myonoffswitchTransparent') as HTMLInputElement;
    transparent.checked = true;


    // Adding
    this.body?.classList.add('transparent-theme');
    sessionStorage.setItem('valexTransparentTheme', 'true');

    // Removing
    sessionStorage.removeItem('dark_theme');
    sessionStorage.removeItem('light_theme');
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

    sessionStorage.removeItem('primary_color');
    sessionStorage.removeItem('primary_hover_color');
    sessionStorage.removeItem('primary_border_color');
    sessionStorage.removeItem('valexdark-primary-color');
    sessionStorage.removeItem('valextransparent-bgImg-primary-color');
    sessionStorage.removeItem('valexBgImage');
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

    sessionStorage.setItem('valextransparent-bgImg-primary-color', this.color5);
    let transparent = document.getElementById('myonoffswitchTransparent') as HTMLInputElement;
    transparent.checked = true;

    if (
      document.querySelector('body')?.classList.contains('bg-img1') == false &&
      document.querySelector('body')?.classList.contains('bg-img2') == false &&
      document.querySelector('body')?.classList.contains('bg-img3') == false &&
      document.querySelector('body')?.classList.contains('bg-img4') == false
    ) {
      document.querySelector('body')?.classList.add('bg-img1');
      sessionStorage.setItem('valexBgImage', 'bg-img1');
    }
    // Adding
    this.body?.classList.add('transparent-theme');
    sessionStorage.setItem('valexTransparentTheme', 'true');

    // Removing
    sessionStorage.removeItem('dark_theme');
    sessionStorage.removeItem('light_theme');
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

    sessionStorage.removeItem('primary_color');
    sessionStorage.removeItem('primary_hover_color');
    sessionStorage.removeItem('primary_border_color');
    sessionStorage.removeItem('valexdark-primary-color');
    sessionStorage.removeItem('valextransparent-primary-color');
    sessionStorage.removeItem('valextransparent-bg-color');
    switcher.removeForTransparent();
    switcher.updateChanges();
  }

  bgImage(e: any) {
    let transparent = document.getElementById('myonoffswitchTransparent') as HTMLInputElement;
    transparent.checked = true;

    let img = e.parentElement.classList[0];
    sessionStorage.setItem('valexBgImage', img);
    // this.body?.classList.add(img);
    let allImg = document.querySelectorAll('.bg-img');
    allImg.forEach((el, i) => {
      let ele = el.classList[0];
      this.body?.classList.remove(ele);
      this.body?.classList.add(img);
    });

    // Adding
    this.body?.classList.add('transparent-theme');
    sessionStorage.setItem('valexTransparentTheme', 'true');

    // Removing
    sessionStorage.removeItem('dark_theme');
    sessionStorage.removeItem('light_theme');
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
    sessionStorage.removeItem('primary_color');
    sessionStorage.removeItem('primary_hover_color');
    sessionStorage.removeItem('primary_border_color');
    sessionStorage.removeItem('valexdark-primary-color');
    sessionStorage.removeItem('valextransparent-primary-color');
    sessionStorage.removeItem('valextransparent-bg-color');
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
    sessionStorage.setItem("default_body","true")
    sessionStorage.removeItem("body_style")
    document.body.classList.remove("body-style1")
    this.updateSwitcher({default_body: true, body_style: false})
  }

  bodyStyle(){
    sessionStorage.setItem("body_style","true")
    sessionStorage.removeItem("default_body")
    document.body.classList.add("body-style1")
    this.updateSwitcher({default_body: false, body_style: true})
  }

  Horizantal(){
    // localStorage.clear()
    this.showSideMenuLayout = false;
    let sideMenuStyle = ['default-menu', 'closed-menu', 'icontext-menu', 'sideicon-menu', 'hover-submenu', 'hover-submenu1', 'double-menu', 'double-menu-tabs']
    sideMenuStyle.forEach((el:any) => {
      document.body.classList.remove(el);
    })
    document.body.classList.add('default-menu');
    sessionStorage.removeItem('vertical_menu')
    sessionStorage.removeItem('hor_hover_menu')
    sessionStorage.setItem("hor_click_menu","true")
    sessionStorage.removeItem('hor_verti_menu');
    // document.querySelector(".badgeDisplayShow")?.classList.add("badgedisplay")
    this.updateSwitcher({vertical_menu: false, hor_click_menu: true, hor_hover_menu: false, hor_verti_menu: false, default_menu: true, closed_menu: false, icon_with_text: false, icon_overlay: false, hover_submenu: false, hover_submenu_style: false, double_menu: false, double_menu_tabs: false})

  }
  VerticalMenu(){
    // localStorage.clear()
    this.showSideMenuLayout = true;
    sessionStorage.setItem('vertical_menu', 'true')
    sessionStorage.removeItem('hor_hover_menu')
    sessionStorage.removeItem('hor_click_menu')
    sessionStorage.removeItem('hor_verti_menu');
    this.updateSwitcher({vertical_menu: true, hor_click_menu: false, hor_hover_menu: false, hor_verti_menu: false, default_menu: false, closed_menu: false, icon_with_text: false, icon_overlay: true, hover_submenu: false, hover_submenu_style: false, double_menu: false, double_menu_tabs: false})
  }
  HorizantalHover(){
    // localStorage.clear()
    this.showSideMenuLayout = false;
    let sideMenuStyle = ['default-menu', 'closed-menu', 'icontext-menu', 'sideicon-menu', 'hover-submenu', 'hover-submenu1', 'double-menu', 'double-menu-tabs']
    sideMenuStyle.forEach((el:any) => {
      document.body.classList.remove(el);
    })
    document.body.classList.add('default-menu');
    sessionStorage.removeItem('vertical_menu')
    sessionStorage.setItem("hor_hover_menu","true")
    sessionStorage.removeItem('hor_click_menu')
    sessionStorage.removeItem('hor_verti_menu');
    this.updateSwitcher({vertical_menu: false, hor_click_menu: false, hor_hover_menu: true, hor_verti_menu: false, default_menu: true, closed_menu: false, icon_with_text: false, icon_overlay: false, hover_submenu: false, hover_submenu_style: false, double_menu: false, double_menu_tabs: false})
  }

  horizontalAndVertical(){
    this.showSideMenuLayout = false;
    let sideMenuStyle = ['default-menu', 'closed-menu', 'icontext-menu', 'sideicon-menu', 'hover-submenu', 'hover-submenu1', 'double-menu', 'double-menu-tabs']
    sideMenuStyle.forEach((el:any) => {
      document.body.classList.remove(el);
    })
    document.body.classList.add('default-menu');
    sessionStorage.removeItem('vertical_menu')
    sessionStorage.removeItem('hor_hover_menu');
    sessionStorage.setItem("hor_click_menu","true")
    sessionStorage.setItem("hor_verti_menu","true");
    // if(event.isTrusted){
      
    // }
    this.updateSwitcher({vertical_menu: false, hor_click_menu: true, hor_hover_menu: false, hor_verti_menu: true, default_menu: true, closed_menu: false, icon_with_text: false, icon_overlay: false, hover_submenu: false, hover_submenu_style: false, double_menu: false, double_menu_tabs: false})
  }

  RTL(){
    document.body.classList.add("rtl")
    document.body.classList.remove("ltr")
    sessionStorage.removeItem("ltr")
    sessionStorage.setItem("rtl","true")
    this.updateSwitcher({rtl: true, ltr:false})
  }

  LTR(){
    document.body.classList.add("ltr")
    document.body.classList.remove("rtl")
    sessionStorage.removeItem("rtl")
    sessionStorage.setItem("ltr","true")
    this.updateSwitcher({rtl: false, ltr:true})
  }

  leftMenuStyle(style:any){
    if(style == 'light'){
      sessionStorage.setItem("light_menu","true")
      sessionStorage.removeItem("color_menu")
      sessionStorage.removeItem("dark_menu")
      sessionStorage.removeItem("gradient_menu")
      this.updateSwitcher({light_menu: true, color_menu: false, dark_menu: false, gradient_menu: false})
    }
    else if(style == 'color'){
      sessionStorage.removeItem("light_menu")
      sessionStorage.setItem("color_menu","true")
      sessionStorage.removeItem("dark_menu")
      sessionStorage.removeItem("gradient_menu")
      this.updateSwitcher({light_menu: false, color_menu: true, dark_menu: false, gradient_menu: false})
    }
    else if(style == 'dark'){
      sessionStorage.removeItem("light_menu")
      sessionStorage.removeItem("color_menu")
      sessionStorage.setItem("dark_menu","true")
      sessionStorage.removeItem("gradient_menu")
      this.updateSwitcher({light_menu: false, color_menu: false, dark_menu: true, gradient_menu: false})
    }
    else if(style == 'gradient'){
      sessionStorage.removeItem("light_menu")
      sessionStorage.removeItem("color_menu")
      sessionStorage.removeItem("dark_menu")
      sessionStorage.setItem("gradient_menu","true")
      this.updateSwitcher({light_menu: false, color_menu: false, dark_menu: false, gradient_menu: true})
    }
  }

  headerStyle(style:any){
    if(style == 'light'){
      sessionStorage.setItem("light_header","true")
      sessionStorage.removeItem("color_header")
      sessionStorage.removeItem("dark_header")
      sessionStorage.removeItem("gradient_header")
      this.updateSwitcher({light_header: true, color_header: false, dark_header: false, gradient_header: false})
    }
    else if(style == 'color'){
      sessionStorage.setItem("color_header","true")
      sessionStorage.removeItem("light_header")
      sessionStorage.removeItem("dark_header")
      sessionStorage.removeItem("gradient_header")
      this.updateSwitcher({light_header: false, color_header: true, dark_header: false, gradient_header: false})
    }
    else if(style == 'dark'){
      sessionStorage.setItem("dark_header","true")
      sessionStorage.removeItem("color_header")
      sessionStorage.removeItem("light_header")
      sessionStorage.removeItem("gradient_header")
      this.updateSwitcher({light_header: false, color_header: false, dark_header: true, gradient_header: false})
    }
    else if(style == 'gradient'){
      sessionStorage.setItem("gradient_header","true")
      sessionStorage.removeItem("color_header")
      sessionStorage.removeItem("dark_header")
      sessionStorage.removeItem("light_header")
      this.updateSwitcher({light_header: false, color_header: false, dark_header: false, gradient_header: true})
    }
  }

  handleTheme(theme:any){
    if(theme == 'light'){
      sessionStorage.setItem("light_menu","true")
      sessionStorage.removeItem("color_menu")
      sessionStorage.removeItem("dark_menu")
      sessionStorage.removeItem("gradient_menu")

      sessionStorage.setItem("light_header","true")
      sessionStorage.removeItem("color_header")
      sessionStorage.removeItem("dark_header")
      sessionStorage.removeItem("gradient_header")
      let lightMenu: any = document.querySelector('#myonoffswitch3');
      lightMenu.checked = true;
      let lightHeader: any = document.querySelector('#myonoffswitch6');
      lightHeader.checked = true;
      this.updateSwitcher({light_theme: true, dark_theme: false, light_menu: true, color_menu: false, dark_menu: false, gradient_menu: false, light_header: true, color_header: false, dark_header: false, gradient_header: false})
    }
    else if( theme == 'dark'){
      sessionStorage.setItem("dark_menu","true")
      sessionStorage.removeItem("light_menu")
      sessionStorage.removeItem("color_menu")
      sessionStorage.removeItem("gradient_menu")

      sessionStorage.setItem("dark_header","true")
      sessionStorage.removeItem("color_header")
      sessionStorage.removeItem("light_header")
      sessionStorage.removeItem("gradient_header")
      let darkMenu:any = document.querySelector('#myonoffswitch5');
      darkMenu.checked = true;
      let darkHeader:any = document.querySelector('#myonoffswitch8');
      darkHeader.checked = true;
      this.updateSwitcher({light_theme: false, dark_theme: true, light_menu: false, color_menu: false, dark_menu: true, gradient_menu: false, light_header: false, color_header: false, dark_header: true, gradient_header: false})
    }
  }


  layoutWidth(style:any){
    if(style == 'full'){
      sessionStorage.setItem("full_width", 'true')
      sessionStorage.removeItem("boxed")
      this.updateSwitcher({full_width: true, boxed: false})
    }
    else if(style == 'boxed'){
      sessionStorage.setItem("boxed", 'true')
      sessionStorage.removeItem("full_width")
      this.updateSwitcher({full_width: false, boxed: true})
    }
  }

  layoutPosition(style:any){
    if(style == 'fixed'){
      sessionStorage.setItem("fixed", 'true')
      sessionStorage.removeItem("scrollable")
      this.updateSwitcher({fixed: true, scrollable: false})
    }
    else if(style == 'scrollable'){
      sessionStorage.setItem("scrollable", 'true')
      sessionStorage.removeItem("fixed")
      this.updateSwitcher({fixed: false, scrollable: true})
    }
  }

  sideMenuLayout(style:any){

    let sideMenuName = ['default_menu','closed_menu','icon_with_text','icon_overlay','hover_submenu','hover_submenu_style','double_menu','double_menu_tabs']
    let sideMenuStyle = ['default-menu', 'closed-menu', 'icontext-menu', 'sideicon-menu', 'hover-submenu', 'hover-submenu1', 'double-menu', 'double-menu-tabs']
    document.body.classList.add('sidenav-toggled');
    if(style == 'default'){
      sideMenuName.forEach((el:any) => {
        sessionStorage.removeItem(el)
      })
      sessionStorage.setItem("default_menu", 'true');

      sideMenuStyle.forEach((el:any) => {
        document.body.classList.remove(el);
      })
      document.body.classList.add('default-menu');
      document.body.classList.remove('sidenav-toggled');
      this.updateSwitcher({default_menu: true, closed_menu: false, icon_with_text: false, icon_overlay: false, hover_submenu: false, hover_submenu_style: false, double_menu: false, double_menu_tabs: false});
    }
    else if(style == 'closed_menu'){
      sideMenuName.forEach((el:any) => {
        sessionStorage.removeItem(el)
      })
      sessionStorage.setItem("closed_menu", 'true');

      sideMenuStyle.forEach((el:any) => {
        document.body.classList.remove(el);
      })
      document.body.classList.add('closed-menu');
      this.updateSwitcher({default_menu: false, closed_menu: true, icon_with_text: false, icon_overlay: false, hover_submenu: false, hover_submenu_style: false, double_menu: false, double_menu_tabs: false});
    }
    else if(style == 'icon_with_text'){
      sideMenuName.forEach((el:any) => {
        sessionStorage.removeItem(el)
      })
      sessionStorage.setItem("icon_with_text", 'true');

      sideMenuStyle.forEach((el:any) => {
        document.body.classList.remove(el);
      })
      document.body.classList.add('icontext-menu');
      this.updateSwitcher({default_menu: false, closed_menu: false, icon_with_text: true, icon_overlay: false, hover_submenu: false, hover_submenu_style: false, double_menu: false, double_menu_tabs: false});
    }
    else if(style == 'icon_overlay'){
      sideMenuName.forEach((el:any) => {
        sessionStorage.removeItem(el)
      })
      sessionStorage.setItem("icon_overlay", 'true');

      sideMenuStyle.forEach((el:any) => {
        document.body.classList.remove(el);
      })
      document.body.classList.add('sideicon-menu');
      this.updateSwitcher({default_menu: false, closed_menu: false, icon_with_text: false, icon_overlay: true, hover_submenu: false, hover_submenu_style: false, double_menu: false, double_menu_tabs: false});
    }
    else if(style == 'hover_submenu'){
      sideMenuName.forEach((el:any) => {
        sessionStorage.removeItem(el)
      })
      sessionStorage.setItem("hover_submenu", 'true');

      sideMenuStyle.forEach((el:any) => {
        document.body.classList.remove(el);
      })
      document.body.classList.add('hover-submenu');
      this.updateSwitcher({default_menu: false, closed_menu: false, icon_with_text: false, icon_overlay: false, hover_submenu: true, hover_submenu_style: false, double_menu: false, double_menu_tabs: false});
    }
    else if(style == 'hover_submenu_style'){
      sideMenuName.forEach((el:any) => {
        sessionStorage.removeItem(el)
      })
      sessionStorage.setItem("hover_submenu_style", 'true');

      sideMenuStyle.forEach((el:any) => {
        document.body.classList.remove(el);
      })
      document.body.classList.add('hover-submenu1');
      this.updateSwitcher({default_menu: false, closed_menu: false, icon_with_text: false, icon_overlay: true, hover_submenu: false, hover_submenu_style: false, double_menu: false, double_menu_tabs: false});
    }
    else if(style == 'double_menu'){
      sideMenuName.forEach((el:any) => {
        sessionStorage.removeItem(el)
      })
      sessionStorage.setItem("double_menu", 'true');

      sideMenuStyle.forEach((el:any) => {
        document.body.classList.remove(el);
      })
      document.body.classList.add('double-menu');
      this.updateSwitcher({default_menu: false, closed_menu: false, icon_with_text: false, icon_overlay: true, hover_submenu: false, hover_submenu_style: false, double_menu: false, double_menu_tabs: false});
    }
    else if(style == 'double_menu_tabs'){
      sideMenuName.forEach((el:any) => {
        sessionStorage.removeItem(el)
      })
      sessionStorage.setItem("double_menu_tabs", 'true');

      sideMenuStyle.forEach((el:any) => {
        document.body.classList.remove(el);
      })
      document.body.classList.add('double-menu-tabs');
      this.updateSwitcher({default_menu: false, closed_menu: false, icon_with_text: false, icon_overlay: true, hover_submenu: false, hover_submenu_style: false, double_menu: false, double_menu_tabs: false});
    }
  }
}
