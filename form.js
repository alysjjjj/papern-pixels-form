var SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxZY36DLA7bIfrk0NhOlCTKdlZC4ipCt9t7LeTMGa0lriBcI8G1iLYmiSLd94sviuyIFg/exec";

var currentStep = 1;
var totalSteps = 4;

var chosenService = null;
var chosenFrame = null;
var chosenMatting = null;
var orderSubmitted = false;

var backBtn = document.getElementById("backBtn");
var nextBtn = document.getElementById("nextBtn");

var albumSection = document.getElementById("albumSection");
var printSection = document.getElementById("printSection");
var mattingSection = document.getElementById("mattingSection");

var pictureUpload = document.getElementById("pictureUpload");
var fileListText = document.getElementById("fileListText");

var printBtn = document.getElementById("printBtn");
var receiptContent = document.getElementById("receiptContent");
var receiptSub = document.getElementById("receiptSub");


// =====================================================
// PILL BUTTONS
// =====================================================

function setupPillToggle(containerId, onPick) {
  var container = document.getElementById(containerId);

  if (!container) return;

  var buttons = container.querySelectorAll(".pill-option");

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {

      buttons.forEach(function (b) {
        b.classList.remove("selected");
      });

      btn.classList.add("selected");

      onPick(btn.getAttribute("data-value"));
    });
  });
}


setupPillToggle("serviceToggle", function (value) {

  chosenService = value;

  if (value === "print") {
    printSection.classList.remove("hidden");
    albumSection.classList.add("hidden");
  } else {
    albumSection.classList.remove("hidden");
    printSection.classList.add("hidden");
  }
});


setupPillToggle("frameToggle", function (value) {

  chosenFrame = value;

  if (value === "yes") {
    mattingSection.classList.remove("hidden");
  } else {

    mattingSection.classList.add("hidden");
    chosenMatting = null;

    var mattingButtons =
      document.querySelectorAll("#mattingToggle .pill-option");

    mattingButtons.forEach(function (b) {
      b.classList.remove("selected");
    });
  }
});


setupPillToggle("mattingToggle", function (value) {
  chosenMatting = value;
});


// =====================================================
// PICTURE FOLDER SELECTION
// =====================================================

pictureUpload.addEventListener("change", function () {

  var files = pictureUpload.files;

  if (files.length === 0) {
    fileListText.textContent = "no folder selected yet";
    return;
  }

  var firstPath =
    files[0].webkitRelativePath || files[0].name;

  var folderName = firstPath.split("/")[0];

  fileListText.textContent =
    "\"" +
    folderName +
    "\" selected — " +
    files.length +
    " file(s) ready to upload";
});


// =====================================================
// STEP DISPLAY
// =====================================================

function showStep(stepNum) {

  for (var i = 1; i <= totalSteps; i++) {
    document
      .getElementById("panel" + i)
      .classList.remove("active");
  }

  document
    .getElementById("panel" + stepNum)
    .classList.add("active");


  var stepItems =
    document.querySelectorAll(".step-item");

  stepItems.forEach(function (item) {

    var num =
      parseInt(item.getAttribute("data-step"));

    item.classList.remove("active", "done");

    if (num < stepNum) {
      item.classList.add("done");
    } else if (num === stepNum) {
      item.classList.add("active");
    }
  });


  var lines =
    document.querySelectorAll(".step-line");

  lines.forEach(function (line) {

    var lineNum =
      parseInt(line.getAttribute("data-line"));

    if (lineNum < stepNum) {
      line.classList.add("filled");
    } else {
      line.classList.remove("filled");
    }
  });


  if (stepNum === 1 || orderSubmitted) {
    backBtn.classList.add("hidden");
  } else {
    backBtn.classList.remove("hidden");
  }


  if (stepNum === 3) {
    nextBtn.textContent = "Submit Order →";
  } else if (stepNum === 4) {
    nextBtn.textContent = "Start New Order";
  } else {
    nextBtn.textContent = "Next →";
  }
}


// =====================================================
// VALIDATION
// =====================================================

function validateStep(stepNum) {

  if (stepNum === 1) {

    var fullName =
      document.getElementById("fullName").value.trim();

    if (fullName === "") {
      alert("Please enter your full name first.");
      return false;
    }

    if (chosenService === null) {
      alert("Please choose Print Only or Print and Album.");
      return false;
    }

    return true;
  }


  if (stepNum === 2) {

    if (chosenService === "album") {

      var productType =
        document.getElementById("productType").value;

      var albumSize =
        document.getElementById("albumSize").value;

      var colorTheme =
        document.getElementById("colorTheme").value;

      var albumQty =
        document.getElementById("albumQty").value;

      if (
        productType === "" ||
        albumSize === "" ||
        colorTheme === "" ||
        albumQty === ""
      ) {
        alert(
          "Please fill out all the album fields (product type, size, color, and quantity)."
        );

        return false;
      }

    } else {

      var printSize =
        document.getElementById("printSize").value;

      var printQty =
        document.getElementById("printQty").value;

      if (
        printSize === "" ||
        chosenFrame === null ||
        printQty === ""
      ) {
        alert(
          "Please fill out all the print fields (size, frame option, and quantity)."
        );

        return false;
      }


      if (
        chosenFrame === "yes" &&
        chosenMatting === null
      ) {
        alert("Please choose if you want matting or not.");
        return false;
      }
    }

    return true;
  }

  return true;
}


// =====================================================
// NAVIGATION
// =====================================================

nextBtn.addEventListener("click", function () {

  if (currentStep === 4) {
    location.reload();
    return;
  }


  if (!validateStep(currentStep)) {
    return;
  }


  if (currentStep === 3) {
    submitOrder();
    return;
  }


  currentStep++;

  showStep(currentStep);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});


backBtn.addEventListener("click", function () {

  if (currentStep <= 1) return;

  currentStep--;

  showStep(currentStep);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});


// =====================================================
// CONVERT FILE TO BASE64
// =====================================================

function fileToBase64(file) {

  return new Promise(function (resolve, reject) {

    var reader = new FileReader();

    reader.onload = function () {

      var result = reader.result;

      // Remove:
      // data:image/jpeg;base64,
      var base64 =
        result.substring(
          result.indexOf(",") + 1
        );

      resolve(base64);
    };

    reader.onerror = function () {
      reject(new Error(
        "Could not read " + file.name
      ));
    };

    reader.readAsDataURL(file);
  });
}


// =====================================================
// SEND JSON TO APPS SCRIPT
// =====================================================

function sendToAppsScript(data) {

  return fetch(SCRIPT_URL, {
    method: "POST",

    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },

    body: JSON.stringify(data)
  })
  .then(function (response) {

    return response.text();

  })
  .then(function (text) {

    try {
      return JSON.parse(text);
    } catch (err) {

      throw new Error(
        "Invalid response from Apps Script: " +
        text.substring(0, 200)
      );
    }
  });
}


// =====================================================
// UPLOAD ONE FILE WITH RETRIES
// =====================================================

function uploadFile(file, folderId) {

  return fileToBase64(file)
    .then(function (base64) {

      var relativePath =
        file.webkitRelativePath || file.name;

      return sendToAppsScript({

        action: "upload",

        folderId: folderId,

        fileName: file.name,

        mimeType:
          file.type || "application/octet-stream",

        relativePath: relativePath,

        base64: base64
      });
    });
}


// =====================================================
// MAIN SUBMIT
// =====================================================

function submitOrder() {

  if (orderSubmitted) return;

  if (
    SCRIPT_URL.indexOf("AKfy") === -1
  ) {
    alert("Apps Script URL is missing.");
    return;
  }


  var fullName =
    document.getElementById("fullName").value.trim();

  var gdriveLink =
    document.getElementById("gdriveLink").value.trim();


  var files =
    Array.from(pictureUpload.files || []);


  // ---------------------------------------------
  // Collect order information
  // ---------------------------------------------

  var orderData = {

    fullName: fullName,

    serviceType: chosenService,

    gdriveLink: gdriveLink,

    productType: "",
    pictureSize: "",
    colorTheme: "",
    quantity: "",
    frame: "",
    matting: "",
    additionalInfo: ""
  };


  var summaryRows = [];


  summaryRows.push([
    "Customer Name",
    fullName
  ]);


  summaryRows.push([
    "Service Type",
    chosenService === "album"
      ? "PRINT AND ALBUM"
      : "PRINT ONLY"
  ]);


  if (chosenService === "album") {

    var productType =
      document.getElementById("productType").value;

    var albumSize =
      document.getElementById("albumSize").value;

    var colorTheme =
      document.getElementById("colorTheme").value;

    var albumQty =
      document.getElementById("albumQty").value;

    var albumNote =
      document.getElementById("albumNote").value.trim();


    orderData.productType = productType;
    orderData.pictureSize = albumSize;
    orderData.colorTheme = colorTheme;
    orderData.quantity = albumQty;
    orderData.additionalInfo = albumNote;


    summaryRows.push([
      "Product Type",
      productType
    ]);

    summaryRows.push([
      "Picture Size",
      albumSize
    ]);

    summaryRows.push([
      "Color Theme",
      colorTheme
    ]);

    summaryRows.push([
      "Picture/Leaves Qty",
      albumQty
    ]);

    summaryRows.push([
      "Additional Info",
      albumNote || "none"
    ]);

  } else {

    var printSize =
      document.getElementById("printSize").value;

    var printQty =
      document.getElementById("printQty").value;

    var printNote =
      document.getElementById("printNote").value.trim();


    orderData.pictureSize = printSize;
    orderData.quantity = printQty;

    orderData.frame =
      chosenFrame === "yes"
        ? "Yes"
        : "No";

    orderData.matting =
      chosenFrame === "yes"
        ? (
            chosenMatting === "yes"
              ? "Yes"
              : "No"
          )
        : "N/A";

    orderData.additionalInfo =
      printNote;


    summaryRows.push([
      "Picture Size",
      printSize
    ]);

    summaryRows.push([
      "Frame",
      orderData.frame
    ]);

    if (chosenFrame === "yes") {

      summaryRows.push([
        "Matting",
        orderData.matting
      ]);
    }

    summaryRows.push([
      "Quantity",
      printQty
    ]);

    summaryRows.push([
      "Additional Info",
      printNote || "none"
    ]);
  }


  summaryRows.push([
    "Google Drive Link (pasted)",
    gdriveLink || "not provided"
  ]);


  summaryRows.push([
    "Pictures Uploaded",
    files.length > 0
      ? files.length + " file(s)"
      : "none"
  ]);


  summaryRows.push([
    "Order Date",
    new Date().toLocaleDateString()
  ]);


  // ---------------------------------------------
  // Go to receipt/loading screen
  // ---------------------------------------------

  currentStep = 4;

  showStep(currentStep);

  nextBtn.disabled = true;

  backBtn.classList.add("hidden");

  receiptSub.textContent =
    "Uploading your order, please wait...";


  receiptContent.innerHTML =
    "<div class='upload-status' id='uploadStatus'>" +
    "Preparing your order..." +
    "</div>";


  // ---------------------------------------------
  // STEP 1: CREATE DRIVE FOLDER
  // ---------------------------------------------

  sendToAppsScript({

    action: "init",

    fullName: fullName

  })

  .then(function (folderData) {

    if (!folderData.success) {

      throw new Error(
        folderData.error ||
        "Could not create Drive folder."
      );
    }


    var folderId =
      folderData.folderId;

    var folderLink =
      folderData.folderLink;


    var status =
      document.getElementById("uploadStatus");


    // No pictures selected
    if (files.length === 0) {

      status.textContent =
        "No pictures were selected. Saving your order...";

      return finalizeOrder(
        orderData,
        folderLink,
        summaryRows
      );
    }


    // -------------------------------------------
    // STEP 2: UPLOAD EACH PICTURE
    // -------------------------------------------

    var uploaded = 0;


    function uploadNext(index) {

      if (index >= files.length) {

        status.textContent =
          "All " +
          files.length +
          " pictures uploaded! Saving your order...";

        return finalizeOrder(
          orderData,
          folderLink,
          summaryRows
        );
      }


      var file = files[index];


      status.textContent =
        "Uploading picture " +
        (index + 1) +
        " of " +
        files.length +
        ": " +
        file.name;


      uploadFile(file, folderId)

        .then(function (data) {

          if (!data.success) {

            throw new Error(
              data.error ||
              "Upload failed for " +
              file.name
            );
          }


          uploaded++;

          uploadNext(index + 1);
        })

        .catch(function (error) {

          console.error(
            "Upload failed:",
            file.name,
            error
          );


          status.innerHTML =
            "<strong>Upload stopped.</strong><br><br>" +
            "The picture <strong>" +
            escapeHtml(file.name) +
            "</strong> could not be uploaded.<br><br>" +
            "Uploaded: " +
            uploaded +
            " of " +
            files.length +
            "<br><br>" +
            "Error: " +
            escapeHtml(error.message);
            

          nextBtn.disabled = false;
        });
    }


    uploadNext(0);

  })

  .catch(function (error) {

    console.error(error);

    nextBtn.disabled = false;

    receiptSub.textContent =
      "Something went wrong.";

    receiptContent.innerHTML =
      "<div class='upload-status error'>" +
      "Could not create the Google Drive folder.<br><br>" +
      escapeHtml(error.message) +
      "</div>";
  });
}


// =====================================================
// FINALIZE ORDER / SAVE TO SHEETS
// =====================================================

function finalizeOrder(
  orderData,
  folderLink,
  summaryRows
) {

  return sendToAppsScript({

    action: "finalize",

    fullName:
      orderData.fullName,

    serviceType:
      orderData.serviceType,

    productType:
      orderData.productType,

    pictureSize:
      orderData.pictureSize,

    colorTheme:
      orderData.colorTheme,

    quantity:
      orderData.quantity,

    frame:
      orderData.frame,

    matting:
      orderData.matting,

    additionalInfo:
      orderData.additionalInfo,

    gdriveLink:
      orderData.gdriveLink,

    folderLink:
      folderLink
  })

  .then(function (data) {

    nextBtn.disabled = false;

    if (!data.success) {

      throw new Error(
        data.error ||
        "Could not save order."
      );
    }


    orderSubmitted = true;


    receiptSub.textContent =
      "Your order was saved. Here's a summary of your order.";


    renderReceiptTable(
      summaryRows,
      folderLink
    );
  })

  .catch(function (error) {

    nextBtn.disabled = false;

    receiptSub.textContent =
      "Something went wrong.";

    receiptContent.innerHTML =
      "<div class='upload-status error'>" +
      "Your pictures may have uploaded, but the order could not be finalized.<br><br>" +
      escapeHtml(error.message) +
      "</div>";

    console.error(error);
  });
}


// =====================================================
// RECEIPT
// =====================================================

function renderReceiptTable(rows, folderLink) {

  var html = "";

  rows.forEach(function (pair) {

    html +=
      "<p><strong>" +
      escapeHtml(pair[0]) +
      ":</strong> " +
      escapeHtml(pair[1]) +
      "</p>";
  });


  if (folderLink) {

    html +=
      "<p><strong>Your Drive Folder:</strong> " +
      "<a href='" +
      escapeHtml(folderLink) +
      "' target='_blank'>" +
      "Open Folder" +
      "</a></p>";
  }


  receiptContent.innerHTML = html;
}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHtml(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// =====================================================
// PRINT
// =====================================================

printBtn.addEventListener("click", function () {
  window.print();
});


// =====================================================
// START
// =====================================================

showStep(currentStep);