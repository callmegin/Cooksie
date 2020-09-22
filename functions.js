// let table = document.getElementById("output_table");
let table;

const reset = () => {
  chrome.runtime.reload();
};

const clear = () => {
  chrome.storage.sync.clear((data) => {});
};

// const outputData = () => {
//   console.log(table);
//   chrome.storage.sync.get((items) => {
//     let obj = items.data;

//     obj.map((elRow) => {
//       // console.log(Object.keys(elRow));
//       let row = table.insertRow();
//     });
//   });
// };
function GenerateRows() {
  this.row = "";
  this.cell = "";
  this.text = "";
  this.setRow = function () {
    this.row = table.insertRow();
  };
  this.newCell = function () {
    this.cell = this.row.insertCell();
  };
  this.addText = function (text) {
    this.text = document.createTextNode(text);
  };
  this.append = function () {
    this.cell.appendChild(this.text);
  };
  // this.table_ = table;
  // this.row = this.table_insertRow();
  // this.setRow = function () {
  //   this.table_.insertRow();
  // };
  // this.newCell = function () {
  //   this.setRow.insertCell();
  // };
  // this.append = function (text) {
  //   this.newCell.appendChild(text);
  // };
}

const objValuesToArray = (obj) => {
  let arr = Object.values(obj);
  return arr;
};
const generateTable = (obj) => {
  // console.log(obj);
  let row = new GenerateRows();
  let outerArr = objValuesToArray(obj);
  let innerArr = [];

  outerArr.map((el) => {
    row.setRow();

    if (typeof el !== "object") {
      //do smth here
    } else {
      // console.log(el);
      innerArr = objValuesToArray(el);

      innerArr.map((innerEl) => {
        // console.log(innerEl);

        row.newCell();
        row.addText();
        row.append();
        // row.newCell();
        // console.log(innerEl);
        // let cell = row.insertCell();
        // let text = document.createTextNode(count);
        // cell.appendChild(text);
      });
      // generateTable(el);
    }
  });
  //for now adding new row can be done here

  //for now adding new row can be done here
  // let row = table.insertRow();
  // let cell = row.insertCell();
  // let text = document.createTextNode(count);
  // cell.appendChild(text);
};
const outputData = () => {
  chrome.storage.sync.get((items) => {
    generateTable(items.data);
  });
};

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#reset").addEventListener("click", reset);
  document.querySelector("#output").addEventListener("click", outputData);
  document.querySelector("#clear").addEventListener("click", clear);
  // clear();
  table = document.querySelector("#output_table");
});
