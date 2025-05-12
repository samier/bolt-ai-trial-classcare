import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'batchStudent'
})
export class BatchStudentPipe implements PipeTransform {

  transform(value: any, args: string) {
    if (!value) return null;

    if (!args) return value;

    const serchValue = args.toLowerCase();
    const searchValueNumber = parseFloat(serchValue);

   return value.filter((item) => {
    // if (!isNaN(searchValueNumber)) {
    //   return item?.student_roll_number?.rollno === searchValueNumber
    // }
      return  item?.full_name?.toLowerCase().includes(serchValue?.toLowerCase()) || item.studentId?.toLowerCase()?.includes(serchValue?.toLowerCase()) || item?.student_roll_number?.rollno === searchValueNumber
    })
  }

}
