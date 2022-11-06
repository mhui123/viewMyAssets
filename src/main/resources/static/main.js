const _rootPath = `${location.origin}/`;
let datas = new Object();
document.addEventListener('DOMContentLoaded', function(){
    ctrl.events();
})


let ctrl = {
    events : async function(){
        let tabcontents = document.getElementsByClassName("tabcontent")[0].children;
        tabcontents["tab01"].style.display = "none";
        tabcontents["tab02"].style.display = "none";
        await cmnEx.getMainInfos();
        cmnEx.gridMyAssetInfo();
        cmnEx.gridTrFrame();

        let lis = Array.from(document.getElementsByClassName("tabnav")[0].children);
        lis.forEach((e, idx) => {
            e.addEventListener("click",async function(){
                tabcontents["tab01"].style.display = "none";
                tabcontents["tab02"].style.display = "none";
                tabcontents[idx].style.display = "";
            })
        })

        Array.from(document.getElementsByTagName("a")).forEach(e => {
            e.addEventListener("click", function(ev) {
                ev.preventDefault();
            })
        })

        document.getElementsByClassName("popupClose")[0].addEventListener("click", function(){
            let modalBg = document.getElementsByClassName("modal-bg")[0];
            let modalWrap = document.getElementsByClassName("modal-wrap")[0];

            modalBg.style.display = "none";
            modalWrap.style.display = "none";
        })
    },

    addSearchEvent : function(){
        document.getElementById("trSearch").addEventListener("click", async function(){
            let paramData = new Object();
            paramData["assetNm"] = document.getElementById("assetlist").value; //종목이름
            paramData["trMethod"] = document.getElementById("trcatg").value; //매수 매도 선택
            datas["trRecord"] = await fetchData('POST', 'getAllList', paramData);
            await doubleToInt(datas["trRecord"]['voList']);
            await cmnEx.gridTrFrame();
        })
    }
}

let cmnEx = {
    getMainInfos : async function(){
        datas["trRecord"] = await fetchData('POST', 'getAllList');
        datas["myAssetInfo"] = await fetchData('POST', 'getMyAssetInfo');

        datas["assetNms"] = Array.from(datas['trRecord']['voList']).map(x => x["assetNm"]);
        datas["assetNms"] = [...new Set(datas["assetNms"])];
        await doubleToInt(datas["myAssetInfo"]["voList"]);
        await doubleToInt(datas["trRecord"]['voList']);
    },

    gridMyAssetInfo : async function(){
        let target = document.getElementById("tab02");
       target.innerHTML = 
            `<table>
                <tbody id="assetTbody">
                    
                </tbody>
            </table>`;
        datas["myAssetInfo"]["voList"].forEach(e => {
            let tr = document.createElement("tr");
            tr.innerHTML = 
                `<td>${e.assetNm}</td>
                 <td class="price">${e.assetAmt}</td>
                 <td class="price">${e.assetPrice}</td>
                 <td class="price">${e.assetTotprice}</td>`;
             document.getElementById("assetTbody").appendChild(tr);
        })
    },

    gridSelectList : async function(){
        datas["assetNms"].forEach(e => {
            let option = document.createElement("option");
            option.value = e;
            option.innerText = e;
            
            document.getElementById("assetlist").appendChild(option);
        })
        return new Promise(resolve => resolve());
    },

    gridTrFrame : async function(){
        let target = document.getElementById("tab01");
        target.replaceChildren();
        target.innerHTML = 
            `
            <div>
                <select name="assets" id="assetlist">
                    <option value="">--자산을 선택해주세요--</option>
                </select>
                <select name="assets" id="trcatg">
                    <option value="">전체</option>
                    <option value="매수">매수</option>
                    <option value="매도">매도</option>
                </select>
                <button id="trSearch">검색</button>
            </div>
            <table>
                <tbody id="trRecordF">
                
                </tbody>
            </table>`;
        await cmnEx.gridSelectList();
        await cmnEx.gridTrDetail();
        return new Promise(resolve => resolve());
    },

    gridTrDetail : async function(){
        Array.from(datas["trRecord"]['voList']).forEach(e => {
            let tr = document.createElement("tr");
            tr.innerHTML = 
            `
            <td>${e.assetNm}</td>
            <td class="price">${e.trAmt}</td>
            <td>${e.trMethod}</td>
            <td class="price">${e.trPrice}</td>
            <td class="price">${e.trTotprice}</td>
            <td class="price">${e.trCost}</td>
            <td>${e.trDate}</td>
            `
            document.getElementById("trRecordF").appendChild(tr);
        })
        ctrl.addSearchEvent();
        return new Promise(resolve => resolve());
    }
}

function doubleToInt(arr){
    let regex = /[^0-9]/g;
    Array.from(arr).filter(x => x.assetCatgNm === "주식").forEach(e => {
        Object.keys(e).forEach(x => {
            if(e[x] && x !== "trDate" && x !== "assetNm"){
                x2 = e[x].replace(regex, "");
                if(x2){
                    e[x] = Number.parseInt(e[x]);
                    e[x] = e[x].toLocaleString("ko-KR");
                }
            }
        })
    })

    return new Promise(resolve => resolve());
}

async function fetchData(type = 'GET', url = '', data = {} ){
    let newUrl = _rootPath + url;
    const response = await fetch(newUrl, {
        method: type, // *GET, POST, PUT, DELETE 등
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // body의 데이터 유형은 반드시 "Content-Type" 헤더와 일치해야 함
    });
    return response.json(); // JSON 응답을 네이티브 JavaScript 객체로 파싱
}