// ======================================
// PAPER AND PIXELS - script.js (v2, step wizard style)
// ======================================

var currentStep = 1;
var totalSteps = 4;

// track the pill toggle choices here since they are just buttons, not real radios
var chosenService = null;   // "print" or "album"
var chosenFrame = null;     // "yes" or "no"
var chosenMatting = null;   // "yes" or "no"

var selectedFiles = []; // holds picked file names

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

// ---------- pill toggle setup (generic function so i dont repeat code) ----------
function setupPillToggle(containerId, onPick) {
  var container = document.getElementById(containerId);
  var buttons = container.querySelectorAll(".pill-option");

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      // clear selected class from siblings first
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
    // also un-select the matting buttons if frame gets turned off
    var mattingButtons = document.querySelectorAll("#mattingToggle .pill-option");
    mattingButtons.forEach(function (b) {
      b.classList.remove("selected");
    });
  }
});

setupPillToggle("mattingToggle", function (value) {
  chosenMatting = value;
});

// ---------- picture upload ----------
pictureUpload.addEventListener("change", function () {
  selectedFiles = [];
  for (var i = 0; i < pictureUpload.files.length; i++) {
    selectedFiles.push(pictureUpload.files[i].name);
  }

  if (selectedFiles.length === 0) {
    fileListText.textContent = "no files selected yet";
  } else {
    fileListText.textContent = selectedFiles.length + " file(s) selected: " + selectedFiles.join(", ");
  }
});

// ---------- step navigation ----------
function showStep(stepNum) {
  // hide all panels then show the one we want
  for (var i = 1; i <= totalSteps; i++) {
    document.getElementById("panel" + i).classList.remove("active");
  }
  document.getElementById("panel" + stepNum).classList.add("active");

  // update the step circles at the top
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

  // update the connecting lines
  var lines = document.querySelectorAll(".step-line");
  lines.forEach(function (line) {
    var lineNum = parseInt(line.getAttribute("data-line"));
    if (lineNum < stepNum) {
      line.classList.add("filled");
    } else {
      line.classList.remove("filled");
    }
  });

  // back button hidden on first step
  if (stepNum === 1) {
    backBtn.classList.add("hidden");
  } else {
    backBtn.classList.remove("hidden");
  }

  // change next button text depending on step
  if (stepNum === 3) {
    nextBtn.textContent = "Generate Receipt";
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

  // step 3 (pictures) has no required fields, gdrive link is optional too
  return true;
}

// ---------- next / generate receipt / restart button ----------
nextBtn.addEventListener("click", function () {

  if (currentStep === 4) {
    // this is now the "Start New Order" button, just reload the page
    location.reload();
    return;
  }

  if (!validateStep(currentStep)) {
    return; // stop here if something is missing
  }

  if (currentStep === 3) {
    buildReceipt();
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

// ---------- build the receipt html ----------
function buildReceipt() {
  var fullName = document.getElementById("fullName").value.trim();
  var gdriveLink = document.getElementById("gdriveLink").value.trim();

  var html = "";
  html += "<p><strong>Customer Name:</strong> " + fullName + "</p>";
  html += "<p><strong>Service Type:</strong> " + (chosenService === "album" ? "PRINT AND ALBUM" : "PRINT ONLY") + "</p>";

  if (chosenService === "album") {
    var productType = document.getElementById("productType").value;
    var albumSize = document.getElementById("albumSize").value;
    var colorTheme = document.getElementById("colorTheme").value;
    var albumQty = document.getElementById("albumQty").value;
    var albumNote = document.getElementById("albumNote").value.trim();

    html += "<p><strong>Product Type:</strong> " + productType + "</p>";
    html += "<p><strong>Picture Size:</strong> " + albumSize + "</p>";
    html += "<p><strong>Color Theme:</strong> " + colorTheme + "</p>";
    html += "<p><strong>Picture/Leaves Qty:</strong> " + albumQty + "</p>";
    html += "<p><strong>Additional Info:</strong> " + (albumNote === "" ? "none" : albumNote) + "</p>";
  } else {
    var printSize = document.getElementById("printSize").value;
    var printQty = document.getElementById("printQty").value;
    var printNote = document.getElementById("printNote").value.trim();

    html += "<p><strong>Picture Size:</strong> " + printSize + "</p>";
    html += "<p><strong>Frame:</strong> " + (chosenFrame === "yes" ? "Yes" : "No") + "</p>";

    if (chosenFrame === "yes") {
      html += "<p><strong>Matting:</strong> " + (chosenMatting === "yes" ? "Yes" : "No") + "</p>";
    }

    html += "<p><strong>Quantity:</strong> " + printQty + "</p>";
    html += "<p><strong>Additional Info:</strong> " + (printNote === "" ? "none" : printNote) + "</p>";
  }

  html += "<p><strong>Google Drive Link:</strong> " + (gdriveLink === "" ? "not provided" : gdriveLink) + "</p>";

  if (selectedFiles.length > 0) {
    html += "<p><strong>Uploaded Pictures:</strong> " + selectedFiles.join(", ") + "</p>";
  } else {
    html += "<p><strong>Uploaded Pictures:</strong> none</p>";
  }

  var today = new Date();
  html += "<p><strong>Order Date:</strong> " + today.toLocaleDateString() + "</p>";

  receiptContent.innerHTML = html;
}

// ---------- print button ----------
printBtn.addEventListener("click", function () {
  window.print();
});

// kick things off on the first step
showStep(currentStep);