import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './componets/header/header.component';
import { FooterComponent } from './componets/footer/footer.component';
import { SidemenuComponent } from './componets/sidemenu/sidemenu.component';
import { TapToTopComponent } from './componets/tap-to-top/tap-to-top.component';
import { LoaderComponent } from './componets/loader/loader.component';
import { NotificationSidebarComponent } from './componets/notification-sidebar/notification-sidebar.component';
import { FullLayoutComponent } from './layouts/full-layout/full-layout.component';
import { ContentLayoutComponent } from './layouts/content-layout/content-layout.component';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FullscreenDirective } from './directives/fullscreen.directive';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { SwitcherComponent } from './componets/switcher/switcher.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { HoverEffectSidebarDirective } from './directives/hover-effect-sidebar.directive';
import { ToggleThemeDirective } from './directives/toggle-theme.directive';
import { SwitcherOneLayoutsComponent } from './layouts/switcher-one-layouts/switcher-one-layouts.component';
import { HeaderOneComponent } from './componets/header-one/header-one.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MultiSelectfocusOnClickDirective } from './directives/multi-selectfocus-on-click.directive';
import { BatchStudentPipe } from './pipes/batch-student.pipe';
import { DataTablesModule } from 'angular-datatables';
import { SingleSelectComponent } from './common-input-component/single-select/single-select.component';
import { InputComponent } from './common-input-component/input/input.component';
import { TextareaComponent } from './common-input-component/textarea/textarea.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DateRangePickerComponent } from './common-input-component/date-range-picker/date-range-picker.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { MultiSelectComponent } from './common-input-component/multi-select/multi-select.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPaginationModule } from 'ngx-pagination';
import { ClipboardModule } from '@angular/cdk/clipboard';
import {MatExpansionModule} from '@angular/material/expansion';
import { DropdownCrudComponent } from './common-input-component/dropdown-crud/dropdown-crud.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { GlobalSearchComponent } from './componets/global-search/global-search.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { MatNativeDateModule, MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CustomDateAdapter } from './DatePicker-Configration/custom-date-adapter';
import { DateFormatService } from '../service/date-format.service';
import { MatDatePickerComponent } from './common-input-component/mat-date-picker/mat-date-picker.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ChartComponent } from './common-component/chart/chart.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { SystemSettingMenuPipe } from './pipes/system-setting-menu.pipe';
import { SystemSettingFieldPipe } from './pipes/system-setting-field.pipe';
import { QuickSearchModalComponent } from './componets/sidemenu/quick-search-modal/quick-search-modal.component';
import { FilterMenuPipe } from './pipes/filter-menu.pipe';
import { QRCodeModule } from 'angularx-qrcode';
import { MatIconModule } from '@angular/material/icon';
import { NewSideBarComponent } from './componets/new-side-bar/new-side-bar.component';
import { SortablejsModule } from 'ngx-sortablejs';
import { HorizontalScrollDirective } from './directives/horizontal-scroll.directive';
import { ReactiveDropdownCrudComponent } from './common-input-component/reactive-dropdown-crud/reactive-dropdown-crud.component';

const COMMON_PIPE = [
  BatchStudentPipe,
  SystemSettingMenuPipe,
  SystemSettingFieldPipe,
]

const COMMON_DIRECTIVE = [
  HoverEffectSidebarDirective,
  FullscreenDirective,
  ToggleThemeDirective,
  MultiSelectfocusOnClickDirective,
  HorizontalScrollDirective,
]

const NGSELECT_MODULE = [
  NgSelectModule
]

const MATERIAL_MODULE = [
  MatExpansionModule,
  MatDatepickerModule,
  MatCardModule,
  MatTabsModule,
  MatTooltipModule,
  MatNativeDateModule,
  MatFormFieldModule,
  MatInputModule,
  MatIconModule
]

const COMMON_COMPONENT = [
  HeaderComponent,
  FooterComponent,
  SidemenuComponent,
  SwitcherComponent,
  TapToTopComponent,
  LoaderComponent,
  NotificationSidebarComponent,
  FullLayoutComponent,
  ContentLayoutComponent,
  SwitcherOneLayoutsComponent,
  HeaderOneComponent,
  SingleSelectComponent,
  InputComponent,
  TextareaComponent,
  MultiSelectComponent,
  DateRangePickerComponent,
  DropdownCrudComponent,
  MatDatePickerComponent,
  ChartComponent,
  ReactiveDropdownCrudComponent
]

const COMMON_MODULE = [
  ReactiveFormsModule,
  FormsModule,
  NgbModule,
  PerfectScrollbarModule,
  ColorPickerModule,
  DataTablesModule,
  RouterModule,
  NgMultiSelectDropDownModule.forRoot(),
  NgxDaterangepickerMd.forRoot({
    separator: ' - ',
    applyLabel: 'Okay',
  }),
  NgxPaginationModule,
  ClipboardModule,
  InfiniteScrollModule,
  AngularEditorModule,
  DragDropModule,
  HighchartsChartModule,
  QRCodeModule,
  SortablejsModule
]

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelPropagation: false
};

@NgModule({
  declarations: [
  COMMON_DIRECTIVE,
  COMMON_PIPE,
  COMMON_COMPONENT,
  GlobalSearchComponent,
  QuickSearchModalComponent,
  FilterMenuPipe,
  NewSideBarComponent
  ],
  imports: [
    CommonModule,
    COMMON_MODULE,
    NGSELECT_MODULE,
    MATERIAL_MODULE,
    NgMultiSelectDropDownModule,
    NgSelectModule,
    ReactiveFormsModule,
    NgbDropdownModule
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    {
      provide: DateAdapter,
      useFactory: (dateFormatService: DateFormatService, matDateLocale: string) => {
        const adapter = new CustomDateAdapter(matDateLocale,dateFormatService);
        // adapter.setDateFormat(dateFormatService.getFormat()); // Use format from DateFormatService
        return adapter;
      },
      deps: [DateFormatService, 'MAT_DATE_LOCALE'],
    },
    { provide: 'MAT_DATE_LOCALE', useValue: 'en-GB' }
  ],
  exports: [
    COMMON_MODULE,
    NGSELECT_MODULE,
    COMMON_PIPE,
    COMMON_COMPONENT,
    COMMON_DIRECTIVE,
    MATERIAL_MODULE
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  
})
export class SharedModule { }
