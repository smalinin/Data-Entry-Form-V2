function shortenLink(str) {
  if (str.includes('#') && str.lastIndexOf("#") != str.length - 1) {
    return str.substring(str.lastIndexOf("#") + 1);
  }
  if (str.includes('/') && str.lastIndexOf("/") != str.length - 1) {
    return str.substring(str.lastIndexOf("/") + 1);
  }
  return str;
}

function formatURI(str) {
  const urlexp = /(https|http|mailto|tel|dav|ftp|ftps|urn)[:^/s]/i;
  if (document.getElementById("fct").checked) {
    if (str.includes(document.getElementById('docName').value) || urlexp.test(str)) {
      str = "https://linkeddata.uriburner.com/describe/?url=" + str.replace("#", "%23");
    }
  }
  return str;
}

function formatDisplay(str) {
  const urlexp = /(https|http|mailto|tel|dav|ftp|ftps|urn)[:^/s]/i;
  if (urlexp.test(str)) {
      return  '<a href=' + formatURI(str) + '" target="_blank" title="' + formatURI(str) + '">' + shortenLink(str) + '</a>';
  }
  return str;
}

async function makeTable(queryURL) {
  var columns = [];
  var tableData = "";
  try {
    await $.ajax({
        type: "GET",
        url: queryURL,
        success: data => {
          var data = Papa.parse(data).data;
          var header = data[0];
          $.each(header, function( key, value ) {
              var curr = {};
              curr.title = value;
              columns.push(curr);
          });
          data.shift(); // remove header row
          data.pop(); // remove extra blank row
          tableData = data;
        },
        error: (request, status, error) => {
          console.error(request.responseText);
          alert(status + ": " + error);
        }
    });
  } catch (err) {}

  // If table already exists destroy it to avoid reinitialization error
  if ($.fn.dataTable.isDataTable('#formTable')) {
    $('#formTable').DataTable().destroy();
  }

  try {
    var table = $('#formTable').DataTable({
        data: tableData,
        columns: columns,
        responsive: true,
        columnDefs: [{
          targets: "_all",
          render: function (data, type, full, meta) {
            return formatDisplay(data);
          }
        }]
      })
  } catch (err) {
    console.error("Error: Could not make table");
  }
};
