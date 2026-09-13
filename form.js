
var SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxZY36DLA7bIfrk0NhOlCTKdlZC4ipCt9t7LeTMGa0lriBcI8G1iLYmiSLd94sviuyIFg/exec";

var currentStep = 1;
var totalSteps = 4;

var chosenService = null;   // "print" or "album"
var chosenFrame = null;     // "yes" or "no"
var chosenMatting = null;   // "yes" or "no"

var orderSubmitted = false; // so we dont accidentally upload twice

// ---------- grab elements ----------
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

// ---------- pill toggle setup (generic function so i dont repeat code) ----------
function setupPillToggle(containerId, onPick) {
  var container = document.getElementById(containerId);
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
    var mattingButtons = document.querySelectorAll("#mattingToggle .pill-option");
    mattingButtons.forEach(function (b) {
      b.classList.remove("selected");
    });
  }
});

setupPillToggle("mattingToggle", function (value) {
  chosenMatting = value;
});

// ---------- folder picker ----------
// webkitdirectory lets them choose a whole folder, browser gives us every
// file inside it with webkitRelativePath telling us the folder structure
pictureUpload.addEventListener("change", function () {
  var files = pictureUpload.files;

  if (files.length === 0) {
    fileListText.textContent = "no folder selected yet";
    return;
  }

  var firstPath = files[0].webkitRelativePath || files[0].name;
  var folderName = firstPath.split("/")[0];

  fileListText.textContent = "\"" + folderName + "\" selected — " + files.length + " file(s) ready to upload";
});

// ---------- step navigation ----------
function showStep(stepNum) {
  for (var i = 1; i <= totalSteps; i++) {
    document.getElementById("panel" + i).classList.remove("active");
  }
  document.getElementById("panel" + stepNum).classList.add("active");

  var stepItems = document.querySelectorAll(".step-item");
  stepItems.forEach(function (item) {
    var num = parseInt(item.getAttribute("data-step"));
    item.classList.remove("active", "done");
    if (num < stepNum) {
      item.classList.add("done");
    } else if (num === stepNum) {
      item.classList.add("active");
    }
  });

  var lines = document.querySelectorAll(".step-line");
  lines.forEach(function (line) {
    var lineNum = parseInt(line.getAttribute("data-line"));
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

function validateStep(stepNum) {
  if (stepNum === 1) {
    var fullName = document.getElementById("fullName").value.trim();
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
      var productType = document.getElementById("productType").value;
      var albumSize = document.getElementById("albumSize").value;
      var colorTheme = document.getElementById("colorTheme").value;
      var albumQty = document.getElementById("albumQty").value;

      if (productType === "" || albumSize === "" || colorTheme === "" || albumQty === "") {
        alert("Please fill out all the album fields (product type, size, color, and quantity).");
        return false;
      }
    } else {
      var printSize = document.getElementById("printSize").value;
      var printQty = document.getElementById("printQty").value;

      if (printSize === "" || chosenFrame === null || printQty === "") {
        alert("Please fill out all the print fields (size, frame option, and quantity).");
        return false;
      }
      if (chosenFrame === "yes" && chosenMatting === null) {
        alert("Please choose if you want matting or not.");
        return false;
      }
    }
    return true;
  }

  return true; // step 3 has nothing required, folder + gdrive link are both optional
}

// ---------- next / submit / restart button ----------
nextBtn.addEventListener("click", function () {

  if (currentStep === 4) {
    location.reload(); // "Start New Order"
    return;
  }

  if (!validateStep(currentStep)) {
    return;
  }

  if (currentStep === 3) {
    submitOrder(); // this moves to step 4 itself once it's done
    return;
  }

  currentStep++;
  showStep(currentStep);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

backBtn.addEventListener("click", function () {
  currentStep--;
  showStep(currentStep);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ---------- gather everything and send it straight to Google Apps Script ----------
function submitOrder() {
  if (orderSubmitted) return; // stop double clicks from uploading twice

  if (SCRIPT_URL.indexOf("PASTE_YOUR") !== -1) {
    alert("The form isn't connected yet — paste your Apps Script Web app URL into form.js first.");
    return;
  }

  var fullName = document.getElementById("fullName").value.trim();
  var gdriveLink = document.getElementById("gdriveLink").value.trim();

  var formData = new FormData();
  formData.append("fullName", fullName);
  formData.append("serviceType", chosenService);
  formData.append("gdriveLink", gdriveLink);

  var summaryRows = []; // used later to print the on-screen receipt

  summaryRows.push(["Customer Name", fullName]);
  summaryRows.push(["Service Type", chosenService === "album" ? "PRINT AND ALBUM" : "PRINT ONLY"]);

  if (chosenService === "album") {
    var productType = document.getElementById("productType").value;
    var albumSize = document.getElementById("albumSize").value;
    var colorTheme = document.getElementById("colorTheme").value;
    var albumQty = document.getElementById("albumQty").value;
    var albumNote = document.getElementById("albumNote").value.trim();

    formData.append("productType", productType);
    formData.append("pictureSize", albumSize);
    formData.append("colorTheme", colorTheme);
    formData.append("quantity", albumQty);
    formData.append("additionalInfo", albumNote);

    summaryRows.push(["Product Type", productType]);
    summaryRows.push(["Picture Size", albumSize]);
    summaryRows.push(["Color Theme", colorTheme]);
    summaryRows.push(["Picture/Leaves Qty", albumQty]);
    summaryRows.push(["Additional Info", albumNote || "none"]);
  } else {
    var printSize = document.getElementById("printSize").value;
    var printQty = document.getElementById("printQty").value;
    var printNote = document.getElementById("printNote").value.trim();

    formData.append("pictureSize", printSize);
    formData.append("quantity", printQty);
    formData.append("frame", chosenFrame === "yes" ? "Yes" : "No");
    formData.append("matting", chosenFrame === "yes" ? (chosenMatting === "yes" ? "Yes" : "No") : "N/A");
    formData.append("additionalInfo", printNote);

    summaryRows.push(["Picture Size", printSize]);
    summaryRows.push(["Frame", chosenFrame === "yes" ? "Yes" : "No"]);
    if (chosenFrame === "yes") {
      summaryRows.push(["Matting", chosenMatting === "yes" ? "Yes" : "No"]);
    }
    summaryRows.push(["Quantity", printQty]);
    summaryRows.push(["Additional Info", printNote || "none"]);
  }

  summaryRows.push(["Google Drive Link (pasted)", gdriveLink || "not provided"]);

  // attach every file from the chosen folder, plus its relative path
  // so the script can rebuild the same folder structure inside Drive
  var files = pictureUpload.files;
  for (var i = 0; i < files.length; i++) {
    formData.append("pictures", files[i]);
    formData.append("relativePaths", files[i].webkitRelativePath || files[i].name);
  }

  summaryRows.push(["Pictures Uploaded", files.length > 0 ? files.length + " file(s)" : "none"]);

  var today = new Date();
  summaryRows.push(["Order Date", today.toLocaleDateString()]);

  // show a loading state while everything uploads
  currentStep = 4;
  showStep(currentStep);
  nextBtn.disabled = true;
  backBtn.classList.add("hidden");
  receiptSub.textContent = "Uploading your order, please wait...";
  receiptContent.innerHTML = "<div class='upload-status' id='uploadStatus'>Sending your pictures to Drive and saving your order... this can take a bit if you have a lot of photos.</div>";

  fetch(SCRIPT_URL, {
    method: "POST",
    body: formData
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      nextBtn.disabled = false;
      orderSubmitted = true;

      if (data.success) {
        receiptSub.textContent = "Your order was saved. Here's a summary of your order.";
        renderReceiptTable(summaryRows, data.folderLink);
      } else {
        receiptSub.textContent = "Something went wrong.";
        receiptContent.innerHTML = "<div class='upload-status error'>We couldn't save your order (" + (data.error || "unknown error") + "). Please try again or contact us directly.</div>";
      }
    })
    .catch(function (err) {
      nextBtn.disabled = false;
      receiptSub.textContent = "Something went wrong.";
      receiptContent.innerHTML = "<div class='upload-status error'>Could not reach the server. Please check your internet connection and try again.</div>";
      console.error(err);
    });
}

function renderReceiptTable(rows, folderLink) {
  var html = "";
  rows.forEach(function (pair) {
    html += "<p><strong>" + pair[0] + ":</strong> " + pair[1] + "</p>";
  });

  if (folderLink) {
    html += "<p><strong>Your Drive Folder:</strong> <a href='" + folderLink + "' target='_blank'>Open Folder</a></p>";
  }

  receiptContent.innerHTML = html;
}

// ---------- print button ----------
printBtn.addEventListener("click", function () {
  window.print();
});

// kick things off on the first step
showStep(currentStep);
