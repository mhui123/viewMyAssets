const _rootPath = `${location.origin}/`;
let 
datas = new Object(),
_pageIndex = 1,
_pageUnit = 20,
sortType = "asc",
sortNm = "date",
savedPageIndex = 0;
;
document.addEventListener('DOMContentLoaded', function(){
    ctrl.events();
})


let ctrl = {
    events : async function(){
        let tabcontents = document.getElementsByClassName("tabcontent")[0].children;
        tabcontents["tab01"].style.display = "";
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

        //더보기
        document.getElementById("moreBtn").addEventListener("click",async function(){
            _pageIndex ++;
            await cmnEx.getMoreTrList();
            await cmnEx.gridTrDetail();
        })
    },

    addSearchEvent : function(){
        document.getElementById("trSearch").addEventListener("click", async function(){
            let target = document.getElementById("trRecordF");
            target.replaceChildren();
            await cmnEx.getMoreTrList();
            await cmnEx.gridTrDetail();
        })
    },
}

let cmnEx = {
    getSummary : async function(){
        let detailInfo = new Array();
        datas["assetNms"].forEach(async e => {
            let result = await cmnEx.calBasicInfo(e);
            detailInfo.push(result);
        })
        datas["summary"] = detailInfo;
        return new Promise(resolve => resolve());
    },
    getMainInfos : async function(){
        datas["trRecord"] = await fetchData('POST', 'getListOpt');
        datas["myAssetInfo"] = await fetchData('POST', 'getMyAssetInfo');
        datas["trInfo"] = await fetchData('POST', 'getAllList');

        datas["assetNms"] = Array.from(datas['trInfo']['voList']).map(x => x["assetNm"]);
        datas["assetNms"] = [...new Set(datas["assetNms"])];
        await doubleToInt(datas["myAssetInfo"]["voList"]);
        await doubleToInt(datas["trRecord"]['voList']);
        await cmnEx.getSummary();
    },

    getMoreTrList : async function(){
        let paramData = new Object();
        paramData["assetNm"] = document.getElementById("assetlist").value; //종목이름
        paramData["trMethod"] = document.getElementById("trcatg").value; //매수 매도 선택
        paramData["pageIndex"] = _pageIndex.toString();

        datas["trRecord"] = await fetchData('POST', 'getListOpt', paramData);
        await doubleToInt(datas["trRecord"]['voList']);

        return new Promise(resolve => resolve());
    },

    gridMyAssetInfo : async function(){
        let target = document.getElementById("tab02");
       target.innerHTML = 
            `
            <h1 class="title">내자산 정보</h1>
            <table class="layerTable">
                <tbody id="assetTbody">
                    
                </tbody>
            </table>
            <h1 class="title">매매정보 요약</h1>
            <table class="layerTable">
                <thead>
                    <td>종목명</td>
                    <td>현재상태</td> <!-- 청산, 보유 -->
                    <td>거래결과</td>
                    <td>매수총액</td>
                    <td>매도총액</td>
                </thead>
                <tbody id="summaryTbody">
                    
                </tbody>
            </table>
            `;
        /*내 자산정보*/
        datas["myAssetInfo"]["voList"].forEach(e => {
            let tr = document.createElement("tr");
            tr.innerHTML = 
                `<td>${e.assetNm}</td>
                 <td class="price">${e.assetAmt}</td>
                 <td class="price">${e.assetPrice}</td>
                 <td class="price">${e.assetTotprice}</td>`;
             document.getElementById("assetTbody").appendChild(tr);
        })

        /*매매정보요약*/
        datas['summary'].forEach(e => {
            let tr = document.createElement("tr");
            strToNum(e);
            let state = chkState(e['buyAmt'] - e['sellAmt']);
            let trResult = ""
            if(state === "청산"){
                trResult = e['sellTotalP'] - e['buyTotalP'] - (e['buyCost'] + e['sellCost']);
            }
            
            tr.innerHTML = 
            `
            <td>${e.name}</td>
            <td>${state}</td>
            <td class="price">${trResult}</td>
            <td class="price">${e.buyTotalP}</td>
            <td class="price">${e.sellTotalP}</td>
            `
            document.getElementById("summaryTbody").appendChild(tr);
        })
       function strToNum(obj){
            Object.keys(obj).forEach(key => {
                if(key !== "name"){
                    obj[key] = Number.parseInt(obj[key]);
                }
            })
       }
       function chkState(val){
            let result;
            if(val === 0){
                result = "청산";
            } else {
                result = "보유";
            }
            return result;
       }
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
        target.innerHTML = `
            <div class="layerTable">
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
            <table class="layerTable">
                <thead>
                    <td onclick="cmnEx.sort('assetNm')">종목명</td>
                    <td>수량</td>
                    <td>거래유형</td>
                    <td>단가</td>
                    <td>금액</td>
                    <td>비용</td>
                    <td onclick="cmnEx.sort('date')">일자</td>
                </thead>
                <tbody id="trRecordF">
                    
                </tbody>
            </table>`;
        await cmnEx.gridSelectList();
        await cmnEx.gridTrDetail();
        ctrl.addSearchEvent();
        return new Promise(resolve => resolve());
    },
    sort : async function(target){
        sortNm = target;
        const changeSortType = {
            asc : "desc",
            desc : "asc"
        }
        sortType = changeSortType[sortType];

        let paramData = new Object();
        savedPageIndex = _pageIndex;
        _pageIndex = 1;
        _pageUnit = _pageUnit * savedPageIndex;
        
        paramData["sortType"] = sortType;
        paramData["sortNm"] = sortNm;
        paramData["pageIndex"] = _pageIndex.toString();
        paramData["pageUnit"] = _pageUnit.toString();
        paramData["assetNm"] = document.getElementById("assetlist").value; //종목이름
        paramData["trMethod"] = document.getElementById("trcatg").value; //매수 매도 선택

        datas["trRecord"] = await fetchData('POST', 'getListOpt', paramData);
        document.getElementById("trRecordF").replaceChildren();
        await doubleToInt(datas["trRecord"]['voList']);
        await cmnEx.gridTrDetail();
    },
    gridTrDetail : async function(){
        Array.from(datas["trRecord"]['voList']).forEach(e => {
            let tr = document.createElement("tr");
            tr.innerHTML = 
            `
            <td onclick="cmnEx.popAssetDetail('${e.assetNm}')">${e.assetNm}</td>
            <td class="price">${e.trAmt}</td>
            <td>${e.trMethod}</td>
            <td class="price">${e.trPrice}</td>
            <td class="price">${e.trTotprice}</td>
            <td class="price">${e.trCost}</td>
            <td>${e.trDate}</td>
            `
            document.getElementById("trRecordF").appendChild(tr);
        })
        
        return new Promise(resolve => resolve());
    },

    popAssetDetail : async function(assetNm){
        let
        modalBg = document.getElementsByClassName("modal-bg")[0],
        modalWrap = document.getElementsByClassName("modal-wrap")[0];
        
        await cmnEx.calBasicInfo(assetNm);
        
        let div = document.getElementsByClassName("popupDiv")[0];
        div.innerHTML = `
            <span><strong>자산이름</strong>${datas['detailInfo']['name']}</span>
            <span><strong>매수수량</strong>${datas['detailInfo']['buyAmt']}</span>
            <span><strong>매수단가</strong>${datas['detailInfo']['buyAvgP']}</span>
            <span><strong>매수총액</strong>${datas['detailInfo']['buyTotalP']}</span>
            <span><strong>매도수량</strong>${datas['detailInfo']['sellAmt']}</span>
            <span><strong>매도단가</strong>${datas['detailInfo']['sellAvgP']}</span>
            <span><strong>매도총액</strong>${datas['detailInfo']['sellTotalP']}</span>
        `;

        modalBg.style.display = "";
        modalWrap.style.display = "";

        return new Promise(resolve => resolve());
    },

    calBasicInfo :async function(assetNm){
        let  detailInfo = new Object();
        detailInfo['base'] = datas['trInfo']['voList'].filter(x => x.assetNm === assetNm);
        await doubleToInt(detailInfo['base'], "N");
        detailInfo['name'] = assetNm;
        detailInfo['buyInfo'] = detailInfo['base'].filter(x => x.trMethod === "매수");
        detailInfo['sellInfo'] = detailInfo['base'].filter(x => x.trMethod === "매도");
        detailInfo['buyAmt'] = getSum([...detailInfo['buyInfo'].map(x => x.trAmt)]);
        detailInfo['buyTotalP'] = getSum([...detailInfo['buyInfo'].map(x => x.trTotprice)]);
        detailInfo['buyAvgP'] = Number.parseInt(detailInfo['buyTotalP'] / detailInfo['buyAmt']);
        detailInfo['sellAmt'] = getSum([...detailInfo['sellInfo'].map(x => x.trAmt)]);
        detailInfo['sellTotalP'] = getSum([...detailInfo['sellInfo'].map(x => x.trTotprice)]);
        detailInfo['sellAvgP'] =  Number.parseInt(detailInfo['sellTotalP'] / detailInfo['sellAmt']);
        detailInfo['buyCost'] = getSum([...detailInfo['buyInfo'].map(x => x.trCost)]);
        detailInfo['sellCost'] = getSum([...detailInfo['sellInfo'].map(x => x.trCost)]);

        delete detailInfo['base'];
        delete detailInfo['buyInfo'];
        delete detailInfo['sellInfo'];

        detailInfo['buyAmt'] = detailInfo['buyAmt'];
        detailInfo['buyTotalP'] = detailInfo['buyTotalP'];
        detailInfo['buyAvgP'] = detailInfo['buyAvgP'];
        detailInfo['sellAmt'] = detailInfo['sellAmt'];
        detailInfo['sellTotalP'] = detailInfo['sellTotalP'];
        detailInfo['sellAvgP'] = detailInfo['sellAvgP'];

        datas['detailInfo'] = detailInfo;
        return new Promise(resolve => resolve(detailInfo));
    }
}

function doubleToInt(arr, opt){
    let regex = /[^0-9]/g;
    Array.from(arr).filter(x => x.assetCatgNm === "주식").forEach(e => {
        if(!e){
            return false;
        }
        Object.keys(e).forEach(x => {
            if(e[x] && e[x].length > 0 && x !== "trDate" && x !== "assetNm"){
                x2 = e[x].replace(regex, "");
                if(x2){
                    e[x] = Number.parseInt(e[x]);
                    if(!opt){
                        e[x] = e[x].toLocaleString("ko-KR");
                    }
                }
            }
        })
    })

    return new Promise(resolve => resolve());
}
function getSum(arr){
    let sum = 0;
    arr.forEach(e => {
        sum += Number.parseInt(e);
    })
    return sum;
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