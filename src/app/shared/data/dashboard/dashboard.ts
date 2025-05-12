import { ApexOptions } from "apexcharts";

export let StatusData = {

    series: [{
        name: 'Impressions',
        data: [74, 85, 57, 56, 76, 35, 61, 98, 36, 50, 48, 29, 57]
    }, {
        name: 'Turnover',
        data: [46, 35, 101, 98, 44, 55, 57, 56, 55, 34, 79, 46, 76]
    }, {
        name: 'In progress',
        data: [26, 35, 41, 78, 34, 65, 27, 46, 37, 65, 49, 23, 49]
    }],

    colors: ["#0162e8", '#f93a5a', '#f7a556'],

    chart: {
        height: 249,
        type: 'bar',
        toolbar: {
            show: false,
        },
        fontFamily: 'Nunito, sans-serif',
    },

    plotOptions: {
        bar: {
            dataLabels: {
                enabled: false
            },
            columnWidth: '42%',
            endingShape: 'rounded',
        }
    },

    dataLabels: {
        enabled: false
    },
    stroke: {
        show: true,
        width: 1,
        endingShape: 'rounded',
        colors: ['transparent'],
    },
    responsive: [{
        breakpoint: 576,
        options: {
            stroke: {
                show: true,
                width: 1,
                endingShape: 'rounded',
                colors: ['transparent'],
            },
        },


    }],

    xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct','Nov','Dec','Jan'],
    },
    yaxis:{},
    fill: {
        opacity: 1
    },
    legend: {
        show: false,
        floating: true,
        position: 'top',
        horizontalAlign: 'left',


    },

    tooltip: {
        y: {
            formatter: function (val:any) {
                return "$ " + val + " thousands"
            }
        }
    }
};

export let OrderData = {

    chart: {
        height: 260,
        type: 'radialBar',
        offsetX: 0,
        offsetY: 0,
    },
    plotOptions: {
        radialBar: {
            startAngle: -135,
            endAngle: 135,
            size: 120,
            imageWidth: 50,
            imageHeight: 50,

            track: {
                strokeWidth: "80%",
                background: '#ecf0fa',
            },
            dropShadow: {
                enabled: false,
                top: 0,
                left: 0,
                bottom: 0,
                blur: 3,
                opacity: 0.5
            },
            dataLabels: {
                name: {
                    fontSize: '16px',
                    color: undefined,
                    offsetY: 30,
                },
                hollow: {
                    size: "60%"
                },
                value: {
                    offsetY: -10,
                    fontSize: '22px',
                    color: undefined,
                    formatter: function (val:any) {
                        return val + "%";
                    }
                }
            }
        }
    },
    colors: ['#0db2de'],
    fill: {
        type: "gradient",
        gradient: {
            shade: "dark",
            type: "horizontal",
            shadeIntensity: .5,
            gradientToColors: ['#005bea'],
            inverseColors: !0,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100]
        }
    },
    stroke: {
        dashArray: 4
    },
    series: [83],
    labels: [""]

};


export let RecentCustomersData = {
    chart: {
        id: 'spark1',
        group: 'sparks',
        type: 'line',
        height: 38,
        sparkline: {
            enabled: true
        },
        dropShadow: {
            enabled: true,
            top: 1,
            left: 1,
            blur: 1,
            opacity: 0.1,
        }
    },
    series: [{
        data: [25, 66, 41, 59, 25, 44, 12, 36, 9, 21]
    }],

    markers: {
        size: 0
    },
    grid: {
        padding: {
            top: 10,
            bottom: 10,
            left: 50
        }
    },
    colors: ['#0a9ae1'],
    stroke: {
        width: 2
    },
    tooltip: {
        x: {
            show: false,
            width: 1,
        },
        y: {
            title: {
                formatter: function formatter(val:any) {
                    return '';
                }
            }
        }
    }

};

export let RecentCustomersData1 = {
    chart: {
        id: 'spark2',
        group: 'sparks',
        type: 'line',
        height: 38,
        sparkline: {
            enabled: true
        },
        dropShadow: {
            enabled: true,
            top: 1,
            left: 1,
            blur: 1,
            opacity: 0.1,
        }
    },
    series: [{
        data: [12, 14, 2, 47, 32, 44, 14, 55, 41, 69]
    }],
    grid: {
        padding: {
            top: 10,
            bottom: 10,
            left: 50
        }
    },
    markers: {
        size: 0
    },
    colors: ['#ff516e'],
    stroke: {
        width: 2
    },
    tooltip: {
        x: {
            show: false
        },
        y: {
            title: {
                formatter: function formatter(val:any) {
                    return '';
                }
            }
        }
    }

};

export let RecentCustomersData2 = {
    chart: {
        id: 'spark3',
        group: 'sparks',
        type: 'line',
        height: 38,
        sparkline: {
            enabled: true
        },
        dropShadow: {
            enabled: true,
            top: 1,
            left: 1,
            blur: 1,
            opacity: 0.1,
        }
    },
    series: [{
        data: [47, 45, 74, 32, 56, 31, 44, 33, 45, 19]
    }],
    markers: {
        size: 0
    },
    grid: {
        padding: {
            top: 10,
            bottom: 10,
            left: 50
        }
    },
    colors: ['#28b98a'],
    xaxis: {
        crosshairs: {
            width: 1
        },
    },
    yaxis: {},
    stroke: {
        width: 2
    },
    tooltip: {
        x: {
            show: false
        },
        y: {
            title: {
                formatter: function formatter(val:any) {
                    return '';
                }
            }
        }
    }
};

export let RecentCustomersData3 = {
    chart: {
        id: 'spark4',
        group: 'sparks',
        type: 'line',
        height: 38,
        sparkline: {
            enabled: true
        },
        dropShadow: {
            enabled: true,
            top: 1,
            left: 1,
            blur: 1,
            opacity: 0.1,
        }
    },
    series: [{
        data: [15, 75, 47, 65, 14, 32, 19, 54, 44, 61]
    }],

    markers: {
        size: 0
    },
    grid: {
        padding: {
            top: 10,
            bottom: 10,
            left: 50
        }
    },
    colors: ['#f48846'],
    xaxis: {
        crosshairs: {
            width: 1
        },
    },
    yaxis:{},
    stroke: {
        width: 2
    },
    tooltip: {
        x: {
            show: false
        },
        y: {
            title: {
                formatter: function formatter(val:any) {
                    return '';
                }
            }
        }
    }

};

export let RecentCustomersData4 = {
    chart: {
        id: 'spark5',
        group: 'sparks',
        type: 'line',
        height: 38,
        sparkline: {
            enabled: true
        },
        dropShadow: {
            enabled: true,
            top: 1,
            left: 1,
            blur: 1,
            opacity: 0.1,
        }
    },
    series: [{
        data: [12, 25, 76, 35, 17, 43, 10, 26, 69, 31]
    }],

    markers: {
        size: 0
    },
    grid: {
        padding: {
            top: 10,
            bottom: 10,
            left: 50
        }
    },
    colors: ['#673ab7'],
    xaxis: {
        crosshairs: {
            width: 1
        },
    },
    yaxis: {},
    stroke: {
        width: 2
    },
    tooltip: {
        x: {
            show: false
        },
        y: {
            title: {
                formatter: function formatter(val:any) {
                    return '';
                }
            }
        }
    }

};
export let RecentCustomersData5 = {
    chart: {
        id: 'spark6',
        group: 'sparks',
        type: 'line',
        height: 38,
        sparkline: {
            enabled: true
        },
        dropShadow: {
            enabled: true,
            top: 1,
            left: 1,
            blur: 1,
            opacity: 0.1,
        }
    },
    series: [{
        data: [12, 35, 56, 35, 12, 34, 10, 62, 69, 31]
    }],

    markers: {
        size: 0
    },
    grid: {
        padding: {
            top: 10,
            bottom: 10,
            left: 50
        }
    },
    colors: ['#0686e4'],
    xaxis: {
        crosshairs: {
            width: 1
        },
    },
    yaxis: {},
    stroke: {
        width: 2
    },
    tooltip: {
        x: {
            show: false
        },
        y: {
            title: {
                formatter: function formatter(val:any) {
                    return '';
                }
            }
        }
    }

};

export let apexSparkline: ApexOptions = {
    chart: {
        type: 'area',
        // width: 120,
        height: 30,
        sparkline: {
            enabled: true,
        },
    },
    stroke: {
        curve: 'straight',
        width: 2,
    },
    fill: {
        opacity: 0.5,
    },
    xaxis:{

    },
    yaxis: {
        min: 0
    },
    colors: ['rgba(255, 255, 255, 0.6)'],
    tooltip: {
        fixed: {
            enabled: false
        },
        x: {
            show: false
        },
        y: {
            title: {
                formatter: function (seriesName) {
                    return "";
                }
            }
        },
        marker: {
            show: false
        },
        onDatasetHover :{
            highlightDataSeries: false
        }
    }
}
export let apexSparkline1: ApexOptions = {

    series: [
        {
            data: [5,9,5,6,4,12,18,14,10,15,12,5,8,5,12,5,12,10,16,12]
        }
    ],
}
export let apexSparkline2: ApexOptions = {

    series: [
        {
            data: [3,2,4,6,12,14,8,7,14,16,12,7,8,4,3,2,2,5,6,7]
        }
    ],
}
export let apexSparkline3: ApexOptions = {

    series: [
        {
            data: [5,10,5,20,22,12,15,18,20,15,8,12,22,5,10,12,22,15,16,10]
        }
    ],
}
export let apexSparkline4: ApexOptions = {

    series: [
        {
            data: [5,9,5,6,4,12,18,14,10,15,12,5,8,5,12,5,12,10,16,12]
        }
    ],
}



export const data:any = {
    chart: {
      entityfillhovercolor: "#4090ff",
      showlabels: "0",
      borderthickness: "0.1",
      entitytooltext:
        "<b>$lname</b>"
    },
    // colorrange: {
    //   minvalue: "20",
    //   color: [
    //     {
    //       minvalue: "20",
    //       maxvalue: "60",
    //       code: "#409cff"
    //     },
    //     {
    //       minvalue: "60",
    //       maxvalue: "80",
    //       code: "#005cbf"
    //     }
    //   ]
    // },
    data: [
      {
        id: "HI",
        value: "70.0"
      },
      {
        id: "DC",
        value: "52.3"
      },
      {
        id: "MD",
        value: "54.2"
      },
      {
        id: "DE",
        value: "55.3"
      },
      {
        id: "RI",
        value: "50.1"
      },
      {
        id: "WA",
        value: "48.3"
      },
      {
        id: "OR",
        value: "48.4"
      },
      {
        id: "CA",
        value: "59.4"
      },
      {
        id: "AK",
        value: "26.6"
      },
      {
        id: "ID",
        value: "44.4"
      },
      {
        id: "NV",
        value: "49.9"
      },
      {
        id: "AZ",
        value: "50.3"
      },
      {
        id: "MT",
        value: "42.7"
      },
      {
        id: "WY",
        value: "62.0"
      },
      {
        id: "UT",
        value: "48.6"
      },
      {
        id: "CO",
        value: "45.1"
      },
      {
        id: "NM",
        value: "53.4"
      },
      {
        id: "ND",
        value: "40.4"
      },
      {
        id: "SD",
        value: "45.2"
      },
      {
        id: "NE",
        value: "48.8"
      },
      {
        id: "KS",
        value: "54.3"
      },
      {
        id: "OK",
        value: "59.6"
      },
      {
        id: "TX",
        value: "64.8"
      },
      {
        id: "MN",
        value: "41.2"
      },
      {
        id: "IA",
        value: "47.8"
      },
      {
        id: "MO",
        value: "54.5"
      },
      {
        id: "AR",
        value: "44.4"
      },
      {
        id: "LA",
        value: "46.4"
      },
      {
        id: "WI",
        value: "43.1"
      },
      {
        id: "IL",
        value: "51.8"
      },
      {
        id: "KY",
        value: "55.6"
      },
      {
        id: "TN",
        value: "57.6"
      },
      {
        id: "MS",
        value: "43.4"
      },
      {
        id: "AL",
        value: "42.8"
      },
      {
        id: "GA",
        value: "53.5"
      },
      {
        id: "MI",
        value: "44.4"
      },
      {
        id: "IN",
        value: "51.7"
      },
      {
        id: "OH",
        value: "50.7"
      },
      {
        id: "PA",
        value: "48.8"
      },
      {
        id: "NY",
        value: "65.4"
      },
      {
        id: "VT",
        value: "42.9"
      },
      {
        id: "NH",
        value: "43.8"
      },
      {
        id: "ME",
        value: "41.0"
      },
      {
        id: "MA",
        value: "47.9"
      },
      {
        id: "CT",
        value: "49.0"
      },
      {
        id: "NJ",
        value: "52.7"
      },
      {
        id: "WV",
        value: "51.8"
      },
      {
        id: "VA",
        value: "55.1"
      },
      {
        id: "NC",
        value: "59.0"
      },
      {
        id: "SC",
        value: "52.4"
      },
      {
        id: "FL",
        value: "40.7"
      }
    ]
  };
  