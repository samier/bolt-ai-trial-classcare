import { Component, OnInit } from '@angular/core';
import { basicTable } from 'src/app/shared/data/tables_data/basic_table';

@Component({
  selector: 'app-basic-tables',
  templateUrl: './basic-tables.component.html',
  styleUrls: ['./basic-tables.component.scss']
})
export class BasicTablesComponent implements OnInit {

  basicTableData = basicTable;

  constructor() { }

  ngOnInit(): void {
  }

}
