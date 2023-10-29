// initialize variables
let fileUploaderInput,
  spritePreview,
  spriteContent = "",
  spriteSheetContainer,
  refCode,
  spriteSheetDownloadButton,
  copyButton,
  copyRefButton,
  htmlRefCodeContent;

window.onload = () => {
  fileUploaderInput = document.getElementById("fileUploaderInput");
  spritePreview = document.getElementById("sprite-preview");
  spriteSheetContainer = document.getElementById("sprite-sheet");
  spriteSheetDownloadButton = document.getElementById(
    "spriteSheetDownloadButton"
  );
  htmlRefCodeContent = document.getElementById("htmlRefCodeContent");

  spriteSheetDownloadButton.addEventListener("click", () => downloadSprite());

  const dropZone = document.getElementById("dropZone");

  dropZone.addEventListener("dragover", handleDragOver);
  dropZone.addEventListener("dragleave", handleDragLeave);
  dropZone.addEventListener("drop", handleDrop);

  copyButton = document.getElementById("copyButton");
  copyRefButton = document.getElementById("copyRefButton");
  copyRefButton.addEventListener("click", copyRefCode);
  copyButton.addEventListener("click", copySpriteSheet);

  // handle file uploader input change event
  if (fileUploaderInput) {
    fileUploaderInput.addEventListener("change", fileUploaderOnchange);
  }
};

// Handle drapover event
function handleDragOver(e) {
  e.preventDefault();
  e.target.classList.add("drop-zone--over");
}

// Handle dragleave event
function handleDragLeave(e) {
  e.preventDefault();
  e.target.classList.remove("drop-zone--over");
}

// Handle drop event
function handleDrop(e) {
  e.preventDefault();
  e.target.classList.remove("drop-zone--over");
  const files = e.dataTransfer.files;
  fileUploaderInput.files = files;
  if (fileUploaderInput.files.length > 0) {
    fileUploaderOnchange();
  }
}

function copySpriteSheet(e) {
  e.preventDefault();
  var range = document.createRange();
  range.selectNode(spriteSheetContainer);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  document.execCommand("copy");
  window.getSelection().removeAllRanges();
}

function copyRefCode(e) {
  e.preventDefault();
  var range = document.createRange();
  range.selectNode(htmlRefCodeContent);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  document.execCommand("copy");
  window.getSelection().removeAllRanges();
}

// Handle file uploader input change event
const fileUploaderOnchange = () => {
  const loadedFiles = Array.from(fileUploaderInput.files);
  const loadedSvgs = Array.from(fileUploaderInput.files);
  let spriteContent = "";

  loadedFiles.forEach((file) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      spriteContent += `
        <div class="sprite">
          <img src="${e.target.result}" alt="${file.name.replace(
        /\.(png|jfif|pjpeg|jpeg|pjp|jpg|webp|gif|ico|bmp|dib|tiff|tif)$/,
        ""
      )}" />
        </div>`;
      spritePreview.innerHTML = spriteContent;
    };

    setTimeout(() => {
      createSpriteSheet(loadedSvgs);
    }, 1000);
    // show sprite sheet progress bar
    let spriteSheetProgress = document.getElementById("spriteSheetProgress");
    let noSpriteSheetView = document.getElementById("no-sprite-sheet-view");
    spriteSheetProgress.style.display = "block";
    spriteSheetProgress.style.visibility = "visible";
    noSpriteSheetView.style.display = "none";
    noSpriteSheetView.style.visibility = "hidden";
    copyButton.style.display = "none";
    copyButton.style.visibility = "hidden";
    setTimeout(() => {
      spriteSheetProgress.style.display = "none";
      spriteSheetProgress.style.visibility = "hidden";
      copyButton.style.display = "block";
      copyButton.style.visibility = "visible";
    }, 1000);
    reader.readAsDataURL(file);
  });
};

const createSpriteSheet = (svgFiles) => {
  const svgContainer = document.createElement("div");
  const refContainer = document.createElement("div");
  let index = 0;
  console.log(svgFiles.length);

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = function (e) {
        const svgText = e.target.result.replace(/<\?xml[^>]+\?>/g, "");
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgElement = svgDoc.querySelector("svg");

        const symbol = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "symbol"
        );
        symbol.setAttribute("id", `symbol-${index}`);
        symbol.setAttribute("viewBox", svgElement.getAttribute("viewBox"));
        symbol.setAttribute("fill", svgElement.getAttribute("fill"));
        symbol.innerHTML = svgElement.innerHTML;
        if (index > 0) {
          // Add a newline before appending the symbol
          svgContainer.appendChild(document.createTextNode("\n "));
        }
        svgContainer.appendChild(symbol);

        const useElement = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "use"
        );
        useElement.setAttribute("xlink:href", `#symbol-${index}`);
        if (index > 0) {
          // Add a newline before appending the symbol
          refContainer.appendChild(document.createTextNode("\n"));
        }
        refContainer.appendChild(useElement);

        index++;

        var svgContent = "";

        if (index === svgFiles.length) {
          svgContent = `
          <svg>
            ${svgContainer.innerHTML}
          </svg>`;
        }

        refCode = `
      <svg class='sprite-svg'>
       ${refContainer.innerHTML}
      </svg>`;

        resolve(svgContent, refCode);
      };

      reader.readAsText(file);
    });
  };

  const promises = svgFiles.map((file) => readFile(file));

  Promise.all(promises)
    .then((contents) => {
      spriteContent = contents.join("");
      spriteSheetContainer.innerText = spriteContent;
      htmlRefCode();
    })
    .catch((error) => {
      console.error("Error reading files:", error);
    });
};

const htmlRefCode = () => {
  let spriteSheetRefCodeLoading = document.getElementById(
    "spriteSheetRefCodeLoading"
  );
  spriteSheetRefCodeLoading.style.display = "block";
  spriteSheetRefCodeLoading.style.visibility = "visible";
  let noRefCodeView = document.getElementById("no-ref-styling-code-view");
  noRefCodeView.style.display = "none";
  noRefCodeView.style.visibility = "hidden";
  copyRefButton.style.display = "none";
  copyRefButton.style.visibility = "hidden";
  setTimeout(() => {
    spriteSheetRefCodeLoading.style.display = "none";
    spriteSheetRefCodeLoading.style.visibility = "hidden";
    copyRefButton.style.display = "block";
    copyRefButton.style.visibility = "visible";
    htmlRefCodeContent.innerText = refCode;
  }, 1000);
};

const downloadSprite = () => {
  // wait to change
  const blob = new Blob([spriteContent], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.download = "sprite-sheet.svg";
  link.href = window.URL.createObjectURL(blob);
  link.click();
};
