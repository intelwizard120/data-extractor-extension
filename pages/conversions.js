$(document).ready(() => {

    chrome.storage.local.get(["token", "userData"], (d) => {
        if((d.token == null || d.token == undefined ||  d.token =="") || (d.userData == null || d.userData == undefined )) {
        console.log(d.token);
        console.log(d.userdata)
        }else {
            $.ajax({
                url: "https://new-app.datatera.io/api/v1/conversion/all-notes/" + d.userData._id,
                type: "GET",
                dataType: "json",
                Headers: {
                    "Authorization": "Bear " + d.token
                },
                success: function (res) {
                    let conversionList = res.getAllConversion;
                    let rows = ""
                    conversionList.forEach(item => {
                        rows += `<div class="tera-conversion-item" id='${item._id}'>
                        <img src="/assets/images/bubble.png" alt="" />&nbsp;&nbsp;
                        <a href='./conversion-actions.html?id=${item._id}' style='color:white'>${item.name}</a>
                      </div>`;
                    })
                    $("#tera-conversion-list").html(rows);
                }
            })
        }
    })
    
})