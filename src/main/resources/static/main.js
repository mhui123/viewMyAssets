const _rootPath = `${location.origin}/`;
let 
datas = new Object(),
_pageIndex = 1,
_pageUnit = 20,
sortType = 'asc',
sortNm = 'date',
savedPageIndex = 0;
;
document.addEventListener('DOMContentLoaded', function(){
    ctrl.events();
})


let ctrl = {
    events : async function(){
        let tabcontents = document.getElementsByClassName('tabcontent')[0].children;
        tabcontents['tab01'].style.display = '';
        tabcontents['tab02'].style.display = 'none';
        await cmnEx.getMainInfos();
        cmnEx.gridMyAssetInfo();
        cmnEx.gridTrFrame();

        let lis = Array.from(document.getElementsByClassName('tabnav')[0].children);
        lis.forEach((e, idx) => {
            e.addEventListener('click',async function(){
                tabcontents['tab01'].style.display = 'none';
                tabcontents['tab02'].style.display = 'none';
                tabcontents[idx].style.display = '';
            })
        })
 
        Array.from(document.getElementsByTagName('a')).forEach(e => {
            e.addEventListener('click', function(ev) {
                ev.preventDefault();
            })
        })

        document.getElementsByClassName('popupClose')[0].addEventListener('click', function(){
            let modalBg = document.getElementsByClassName('modal-bg')[0];
            let modalWrap = document.getElementsByClassName('modal-wrap')[0];

            modalBg.style.display = 'none';
            modalWrap.style.display = 'none';
        })

        //더보기
        document.getElementById('moreBtn').addEventListener('click',async function(){
            _pageIndex ++;
            await cmnEx.getMoreTrList();
            await cmnEx.gridTrDetail();
        })
    },

    addSearchEvent : function(){
        document.getElementById('trSearchBtn').addEventListener('click', async function(){
            let target = document.getElementById('trRecordF');
            target.replaceChildren();
            await cmnEx.getMoreTrList();
            await cmnEx.gridTrDetail();
        })
    },
    addTrEvnet : function(){
        document.getElementById('addTrBtn').addEventListener('click', function(){
            cmnEx.openPopup('addTr');
        })
    }
}

let cmnEx = {
    getSummary : async function(){
        let detailInfo = new Array();
        datas['assetNms'].forEach(async e => {
            let result = await cmnEx.calBasicInfo(e);
            detailInfo.push(result);
        })
        datas['summary'] = detailInfo;
        return new Promise(resolve => resolve());
    },
    getMainInfos : async function(){
        datas['trRecord'] = await fetchData('POST', 'getListOpt');
        datas['myAssetInfo'] = await fetchData('POST', 'getMyAssetInfo');
        datas['trInfo'] = await fetchData('POST', 'getAllList');

        datas['assetNms'] = Array.from(datas['trInfo']['voList']).map(x => x['assetNm']);
        datas['assetNms'] = [...new Set(datas['assetNms'])];
        await doubleToInt(datas['myAssetInfo']['voList']);
        await doubleToInt(datas['trRecord']['voList']);
        await cmnEx.getSummary();
    },

    getMoreTrList : async function(){
        let paramData = new Object();
        paramData['assetNm'] = document.getElementById('assetlist').value; //종목이름
        paramData['trMethod'] = document.getElementById('trcatg').value; //매수 매도 선택
        paramData['pageIndex'] = _pageIndex.toString();

        datas['trRecord'] = await fetchData('POST', 'getListOpt', paramData);
        await doubleToInt(datas['trRecord']['voList']);

        return new Promise(resolve => resolve());
    },

    gridMyAssetInfo : async function(){
        let target = document.getElementById('tab02');
       target.innerHTML = 
            `
            <h1 class='title'>내자산 정보</h1>
            <table class='layerTable'>
                <tbody id='assetTbody'>
                    
                </tbody>
            </table>
            <h1 class='title'>매매정보 요약</h1>
            <table class='layerTable'>
                <thead>
                    <td>종목명</td>
                    <td>현재상태</td> <!-- 청산, 보유 -->
                    <td>거래결과</td>
                </thead>
                <tbody id='summaryTbody'>
                    
                </tbody>
            </table>
            `;
        /*내 자산정보*/
        datas['myAssetInfo']['voList'].forEach(e => {
            let tr = document.createElement('tr');
            tr.innerHTML = 
                `<td onclick='cmnEx.openPopup('detail', '${e.assetNm}')'>${e.assetNm}</td>
                 <td class='price'>${e.assetAmt}</td>
                 <td class='price'>${e.assetPrice}</td>
                 <td class='price'>${e.assetTotprice}</td>`;
             document.getElementById('assetTbody').appendChild(tr);
        })

        /*매매정보요약*/
        datas['summary'].forEach(e => {
            let tr = document.createElement('tr');
            strToNum(e);
            let state = chkState(e['buyAmt'] - e['sellAmt']);
            let trResult = ''
            if(state === '청산'){
                trResult = e['sellTotalP'] - e['buyTotalP'] - (e['buyCost'] + e['sellCost']);
            }
            
            tr.innerHTML = 
            `
            <td>${e.name}</td>
            <td>${state}</td>
            <td class='price'>${trResult}</td>
            `
            document.getElementById('summaryTbody').appendChild(tr);
        })
       function strToNum(obj){
            Object.keys(obj).forEach(key => {
                if(key !== 'name'){
                    obj[key] = Number.parseInt(obj[key]);
                }
            })
       }
       function chkState(val){
            let result;
            if(val === 0){
                result = '청산';
            } else {
                result = '보유';
            }
            return result;
       }
    },

    gridSelectList : async function(){
        datas['assetNms'].forEach(e => {
            let option = document.createElement('option');
            option.value = e;
            option.innerText = e;
            
            document.getElementById('assetlist').appendChild(option);
        })
        return new Promise(resolve => resolve());
    },

    gridTrFrame : async function(){
        let target = document.getElementById('tab01');
        target.innerHTML = `
            <div class='layerTable'>
                <select name='assets' id='assetlist'>
                    <option value=''>--자산을 선택해주세요--</option>
                </select>
                <select name='assets' id='trcatg'>
                    <option value=''>전체</option>
                    <option value='매수'>매수</option>
                    <option value='매도'>매도</option>
                </select>
                <button id='trSearchBtn'>검색</button>
                <button id='addTrBtn' onclick='cmnEx.openPopup('add')'>거래내역추가</button>
            </div>
            <table class='layerTable'>
                <thead>
                    <td onclick='cmnEx.sort('assetNm')'>종목명</td>
                    <td>수량</td>
                    <td>거래유형</td>
                    <td>단가</td>
                    <td>금액</td>
                    <td>비용</td>
                    <td onclick='cmnEx.sort('date')'>일자</td>
                </thead>
                <tbody id='trRecordF'>
                    
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
            asc : 'desc',
            desc : 'asc'
        }
        sortType = changeSortType[sortType];

        let paramData = new Object();
        savedPageIndex = _pageIndex;
        _pageIndex = 1;
        _pageUnit = _pageUnit * savedPageIndex;
        
        paramData['sortType'] = sortType;
        paramData['sortNm'] = sortNm;
        paramData['pageIndex'] = _pageIndex.toString();
        paramData['pageUnit'] = _pageUnit.toString();
        paramData['assetNm'] = document.getElementById('assetlist').value; //종목이름
        paramData['trMethod'] = document.getElementById('trcatg').value; //매수 매도 선택

        datas['trRecord'] = await fetchData('POST', 'getListOpt', paramData);
        document.getElementById('trRecordF').replaceChildren();
        await doubleToInt(datas['trRecord']['voList']);
        await cmnEx.gridTrDetail();
    },
    gridTrDetail : async function(){
        Array.from(datas['trRecord']['voList']).forEach(e => {
            let tr = document.createElement('tr');
            tr.innerHTML = 
            `
            <!--  onclick='cmnEx.popAssetDetail('${e.assetNm}')' -->
            <td>${e.assetNm}</td>
            <td class='price'>${e.trAmt}</td>
            <td>${e.trMethod}</td>
            <td class='price'>${e.trPrice}</td>
            <td class='price'>${e.trTotprice}</td>
            <td class='price'>${e.trCost}</td>
            <td>${e.trDate}</td>
            `
            document.getElementById('trRecordF').appendChild(tr);
        })
        
        return new Promise(resolve => resolve());
    },
    openPopup : async function(...args){
        let
        modalBg = document.getElementsByClassName('modal-bg')[0],
        modalWrap = document.getElementsByClassName('modal-wrap')[0];
        
        const keywords = {
            detail : cmnEx.popAssetDetail,
            add : cmnEx.gridAddTrFrame,
        }

        modalBg.style.display = '';
        modalWrap.style.display = '';
        if(args[0] === 'detail'){
            let assetNm = args[1];
            await keywords[args[0]](assetNm);
        } else {
            await keywords[args[0]]();
        }
    },
    addTr : async function(e){
        let paramData = new Object();
        paramData['assetNm'] = e['assetNm'];
        paramData['assetCatgNm'] = document.getElementById('popAssetCatg').value;
        paramData['trMethod'] = e['trMethod'];
        paramData['trAmt'] = e['trAmt'].toString();
        paramData['trPrice'] = e['trPrice'].toString();
        paramData['trTotprice'] = e['trTotprice'].toString();
        paramData['trCost'] = e['fee'] + e['tax'].toString();
        paramData['trResult'] = e['result'].toString();
        paramData['trEarnrate'] = e['earndate'].toString();
        paramData['trDate'] = e['trDate'].toString();
        let result = await fetchData('POST', 'writeTrRecord', paramData);
        console.log(result);
        return new Promise(resolve => resolve());
    },
    gridAddTrFrame : async function(){
        let div = document.getElementsByClassName('popupDiv')[0];
        let title = document.getElementsByClassName('popupH1')[0];
        title.innerText = '거래내역 추가';
        div.innerHTML = `
        <select name='assets' id='popAssetCatg'>
            <option value=''>--자산을 선택해주세요--</option>
        </select>
        <input class='trRecords' placeholder = '내용을 입력해주세요' style='display:none;'>
        <button class='popBtn' id='insertBtn'>입력</button>`;

        datas['trInfo']['assetCatg'].forEach(e => {
            let opt = document.createElement('option');
            opt.value = e['assetCatgNm'];
            opt.innerText = e['assetCatgNm'];
            document.getElementById('popAssetCatg').appendChild(opt);
        })

        //드롭박스 값 입력
        document.getElementById(`popAssetCatg`).addEventListener('change', function(e){
            console.log(this.value);
            if(this.value === '주식'){
                document.getElementsByClassName('trRecords')[0].style.display = '';
            }
        })
        //입력이벤트
        document.getElementById('insertBtn').addEventListener('click',async function(){
            if(datas['cols'] && datas['cols'].length > 0){
                datas['cols'].forEach( async e => {
                    await cmnEx.addTr(e);
                })
                await cmnEx.getSummary();
            }
        })
        //데이터 복붙시 정리이벤트
        document.getElementsByClassName('trRecords')[0].addEventListener('keyup', function(e){
            console.log(e['target']['value']);
            //let divid = e['target']['value'].split('\t');

            //입력받은 데이터 가공
            let filtered = e['target']['value'];
            if(filtered.match('KODEX 200')){
                filtered = filtered.replaceAll('KODEX 200', 'KODEX_200');
            }
            if(filtered.match('TIGER KRX BBIG K-뉴')){
                filtered = filtered.replaceAll('TIGER KRX BBIG K-뉴?', 'TIGER_KRX_BBIG_K-뉴딜');
            }
            let rows = filtered.split(' ');
            datas['rows'] = rows;
            datas['cols'] = new Array();
            rows.forEach(e => {
                let temp = new Object();
                let colHs = ['trDate', 'assetNm', '구분', 'trMethod', 'trAmt', 'trPrice', 'buyPrice', 'sellTotPrice', 'buyTotPrice', 'fee', 'tax',  'result', 'earndate']
                let cols = e.split('\t');
                cols.forEach((col, idx) => {
                    if(colHs[idx] !== '구분'){
                        if(colHs[idx] === 'trMethod'){
                            if(col === '01'){
                                temp[colHs[idx]] = '매도';
                            } else if(col === '02'){
                                temp[colHs[idx]] = '매수';
                            }
                        } else {
                            temp[colHs[idx]] = col;
                        }
                    } 
                })
                datas['cols'].push(temp);
            });

            datas['cols'].forEach(async e => {
                //datas['cols'] 데이터 정리
                let needFix = ['trAmt', 'trPrice', 'buyPrice', 'sellTotPrice', 'buyTotPrice', 'fee', 'tax', 'result'];
                try{
                Object.keys(e).forEach(key => {
                    if(e[key] && e[key].length > 0 && needFix.includes(key)){
                            e[key] = e[key].replaceAll(',', ''); //컴마제거
                            e[key] = Number(e[key]);
                    }
                    //이름에 언더바 들어간 항목 제거
                    if(key === 'assetNm' && e[key].includes('_')){
                        e[key] = e[key].replaceAll('_', ' ');
                    }
                    //매수 매도 판별
                    if(key === 'trMethod' && e[key] === '매도'){
                        e['sellTotPrice'] = e['sellTotPrice'].replaceAll(',', ''); //컴마제거
                        e['sellTotPrice'] = Number(e['sellTotPrice']);
                        e['trTotprice'] = Number(e['sellTotPrice']);
                    } else if(key === 'trMethod' && e[key] === '매수'){
                        e['buyTotPrice'] = e['buyTotPrice'].replaceAll(',', ''); //컴마제거
                        e['buyTotPrice'] = Number(e['buyTotPrice']);
                        e['trTotprice'] = Number(e['buyTotPrice']);
                    }
                })
                
                }catch(E){
                    console.log(E);
                }
            })
        })
        /*
            if(e['target']['value'].match('\t')){
                e['target']['value'] = divid[0];
                document.querySelector('.trRecords').nextElementSibling.focus();
                document.querySelector('.trRecords').nextElementSibling.value = divid[1];
            }
        */
        return new Promise(resolve => resolve());
    },
    
    popAssetDetail : async function(assetNm){
        let div = document.getElementsByClassName('popupDiv')[0];
        let title = document.getElementsByClassName('popupH1')[0];
        title.innerText = '자산 상세';

        await cmnEx.calBasicInfo(assetNm);
        div.innerHTML = `
        <table>
            <tbody>
                <tr>
                    <td>자산이름</td><td>${datas['detailInfo']['name']}</td>
                </tr>
                <tr>
                    <td>매수수량</td><td>${datas['detailInfo']['buyAmt'].toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>매수단가</td><td>${datas['detailInfo']['buyAvgP'].toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>매수총액</td><td>${datas['detailInfo']['buyTotalP'].toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>매도수량</td><td>${datas['detailInfo']['sellAmt'].toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>매도단가</td><td>${datas['detailInfo']['sellAvgP'].toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>매도총액</td><td>${datas['detailInfo']['sellTotalP'].toLocaleString('ko-KR')}</td>
                </tr>
            </tbody>
        </table>`;

        return new Promise(resolve => resolve());
    },

    calBasicInfo :async function(assetNm){
        let  detailInfo = new Object();
        detailInfo['base'] = datas['trInfo']['voList'].filter(x => x.assetNm === assetNm);
        await doubleToInt(detailInfo['base'], 'N');
        detailInfo['name'] = assetNm;
        detailInfo['buyInfo'] = detailInfo['base'].filter(x => x.trMethod === '매수');
        detailInfo['sellInfo'] = detailInfo['base'].filter(x => x.trMethod === '매도');
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
    Array.from(arr).filter(x => x.assetCatgNm === '주식').forEach(e => {
        if(!e){
            return false;
        }
        Object.keys(e).forEach(x => {
            if(e[x] && e[x].length > 0 && x !== 'trDate' && x !== 'assetNm'){
                x2 = e[x].replace(regex, '');
                if(x2){
                    e[x] = Number.parseInt(e[x]);
                    if(!opt){
                        e[x] = e[x].toLocaleString('ko-KR');
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
        body: JSON.stringify(data), // body의 데이터 유형은 반드시 'Content-Type' 헤더와 일치해야 함
    });
    return response.json(); // JSON 응답을 네이티브 JavaScript 객체로 파싱
}