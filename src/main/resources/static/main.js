const _rootPath = `${location.origin}/`;
let 
datas = new Object(),
_pageIndex = 1,
_pageUnit = 20,
sortType = 'asc',
sortNm = 'date',
savedPageIndex = 0,
_assetCatg = '주식';
;
document.addEventListener('DOMContentLoaded', function(){
    ctrl.events();
    //cmnEx.alert('todo : 총손익 히스토리를 담는 테이블 구현 및 호출로직 필요');
})


let ctrl = {
    events : async function(){
        let tabcontents = document.getElementsByClassName('tabcontent')[0].children;
        tabcontents['tab01'].style.display = 'none';
        tabcontents['tab02'].style.display = '';
        await cmnEx.getMainInfos();
        await cmnEx.gridMyAssetInfo();
        await cmnEx.gridTrFrame();

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
            let div = document.getElementsByClassName('popupDiv')[0];
            div.style.display = '';
            div.style.alignItems = '';
            div.style.height = '';
            modalWrap.style.width = '100vw';
            modalWrap.style.height = '50vh';
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
    },
    addTrBtnEvent : function(){
        if(document.getElementsByName('catgBtn').length === 0){
            return false;
        }
        document.getElementsByName('catgBtn').forEach(e => {
            e.addEventListener('click', function(element){
                _assetCatg = element.target.innerText;
            })
        })
    }
}

let cmnEx = {
    getMainInfos : async function(){
        datas['trRecord'] = await fetchData('POST', 'getListOpt');
        datas['myAssetInfo'] = await fetchData('POST', 'getMyAssetInfo');
        datas['trInfo'] = await fetchData('POST', 'getAllList');

        datas['assetNms'] = Array.from(datas['trInfo']['voList']).map(x => x['assetNm']);
        datas['assetNms'] = [...new Set(datas['assetNms'])];
        await doubleToInt(datas['myAssetInfo']['voList']);
        await doubleToInt(datas['trRecord']['voList']);
        await cmnEx.getSummary();

        datas['allTrHist'] = await fetchData('POST', 'getTrHistEachInfo');
        return new Promise(resolve => resolve());
    },

    getMoreTrList : async function(){
        let paramData = new Object();
        paramData['assetNm'] = document.getElementById('assetlist').value; //종목이름
        paramData['trMethod'] = document.getElementById('trcatg').value; //매수 매도 선택
        paramData['pageIndex'] = _pageIndex.toString();
        paramData['startDate'] = document.getElementsByClassName('datepicker-input')[0]['value'] ?? '';
        paramData['endDate'] = document.getElementsByClassName('datepicker-input')[1]['value'] ?? '';

        datas['trRecord'] = await fetchData('POST', 'getListOpt', paramData);
        if(paramData['startDate'] && paramData['endDate']){
            datas['trInfoPeriod'] = await fetchData('POST', 'getAllList', paramData);
            cmnEx.getSummary(paramData['startDate']);
        }
        await doubleToInt(datas['trRecord']['voList']);
        datas['eachTrHist'] = await fetchData('POST', 'getTrHistEachInfo', paramData);

        return new Promise(resolve => resolve());
    },

    gridMyAssetInfo : async function(){
        let target = document.getElementById('tab02');
        target.innerHTML = 
            `
            <div class='btn-group'>
                <button id='assetCatg1' name='catgBtn'>주식</button>
                <button id='assetCatg2' name='catgBtn'>코인</button>
                <button id='assetCatg3' name='catgBtn'>골드</button>
            </div>
            <h1 class='title'>내자산 정보</h1>
            <table class='layerTable'>
                <tbody id='assetTbody'>
                    
                </tbody>
            </table>
            <h1 class='title'>매매정보 요약</h1>
            <table class='layerTable'>
                <thead>
                    <td onclick="cmnEx.sort('name')">종목명</td>
                    <td onclick="cmnEx.sort('state')">현재상태</td> <!-- 청산, 보유 -->
                    <td onclick="cmnEx.sort('result')">거래결과</td>
                </thead>
                <tbody id='summaryTbody'>
                    
                </tbody>
            </table>
            `;
        ctrl.addTrBtnEvent();
        /*내 자산정보*/
        datas['myAssetInfo']['voList'].forEach((e, idx) => {
            let tr = document.createElement('tr');
            let temp = datas['summary'].filter(f => f.assetNm === e.assetNm)[0];
            tr.innerHTML = 
                `<td onclick="cmnEx.openPopup('detail', '${e.assetNm}', '${e.assetNowTotal ?? e.assetTotprice}')" id="assetNm${idx}">${e.assetNm}</td>
                 <td class='price' id="assetAmt${idx}">${e.assetAmt}</td>
                 <td class='price' id="assetPrice${idx}" onclick="cmnEx.changeToNewP(this)">${e.assetNowAvg ?? e.assetPrice}</td>
                 <!--<td class='price' id="assetTotprice${idx}" data-idx="${idx}" onclick="cmnEx.changeToInput(this)" data-value="${e.assetNowTotal ?? e.assetTotprice}" data-isOn="false" data-assetnm="${e.assetNm}">${(e.assetNowTotal ?? e.assetTotprice).toLocaleString('ko-KR')}</td>-->
                 <td class='price' id="assetTotprice${idx}" data-idx="${idx}" data-assetnm="${e.assetNm}">${(e.assetNowTotal ?? e.assetTotprice).toLocaleString('ko-KR')}</td>`;
             document.getElementById('assetTbody').appendChild(tr);
        })

        /*매매정보요약*/
        datas['summary'].forEach(e => {
            let tr = document.createElement('tr');
            strToNum(e);
            let state = chkState(e['buyAmt'] - e['sellAmt']);
            let trResult = ''
            if(state === '청산'){
                trResult = e['sellTotalP'] - e['buyTotalP'] + (e['buyCost'] - e['sellCost']);
            }
            /*
            else if(state === '보유'){
                trResult = (e['totalEarn'] ?? 0 ) + (e['sellTotResult'] ?? 0);
            }
            */
            tr.innerHTML = 
            `
            <td>${e['assetNm']}</td>
            <td>${state}</td>
            <td class='price' name="trResult">${trResult}</td>
            `
            document.getElementById('summaryTbody').appendChild(tr);
        })

        //총계출력
        let sum = 0;
        Array.from(document.getElementsByName('trResult')).forEach(e => {
            sum += Number(e.innerText);
        })

        let h2 = document.createElement('h2');
        h2.innerHTML = `총계 : ${sum}원`;
        document.getElementById('tab02').appendChild(h2);

        return new Promise(resolve => resolve());
    },
    changeToNewP : function(element){
        let amt = Number(element.previousElementSibling.innerText.replaceAll(',', ''));
        let tot = Number(element.nextElementSibling.innerText.replaceAll(',', ''));
        let assetNm = element.previousElementSibling.previousElementSibling.innerText;
        let avg = Math.ceil(tot/amt);

        let paramData = new Object();
        paramData['assetNm'] = assetNm;
        paramData['assetNowAvg'] = avg.toString();

        cmnEx.updateAsset(paramData);
        location.reload();
    },
    /*
    sort : function(...args){
        if(args[0] === 'name'){

        }
        if(args[0] === 'state'){}
        if(args[0] === 'result'){}
    },
    */
    /*
    changeToInput : function(element){
        let bfV = element.dataset.value;
        datas['clickedE'] = element;
        let targetV = datas['clickedE']?.['children']?.[0]?.value ?? "";
        if(element.dataset.ison === "true"){
            if(bfV !== targetV){
                console.log("수정해야함");
                console.log(targetV);
                let regex = /[^0-9]/g;
                if(regex.test(targetV)){
                    targetV = targetV.replaceAll(regex, '');
                }
                element.value = targetV.toLocaleString('ko-KR');
                element.dataset.value = targetV;
            }
            element.innerHTML = targetV;
            element.dataset.ison = "false";

            //총액수정
           let idx = element.dataset.idx;
           let paramData = new Object();
           paramData['assetNm'] = document.getElementById(`assetNm${idx}`).innerText;
           paramData['assetAmt'] = document.getElementById(`assetAmt${idx}`).innerText;
           paramData['assetNowTotal'] = targetV;

           console.log(paramData);
           cmnEx.updateAsset(paramData);
        } else {
            let parsedV = Number(element.dataset.value.replaceAll(',', ''));
            element.dataset.ison = "true";
            element.innerHTML = `<input type="text" class="modifyAsset" value="${parsedV}" pattern="[0-9]+">`;
            let input = element.children[0];
            const end = input.value.length;
            input.setSelectionRange(end, end);
            input.focus();
        }
    },
    */
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
                <div class='btn-group'>
                    <button id='assetCatg1' name='catgBtn'>주식</button>
                    <button id='assetCatg2' name='catgBtn'>코인</button>
                    <button id='assetCatg3' name='catgBtn'>골드</button>
                </div>
                <select name='assets' id='assetlist'>
                    <option value=''>--자산을 선택해주세요--</option>
                </select>
                <select name='assets' id='trcatg'>
                    <option value=''>전체</option>
                    <option value='매수'>매수</option>
                    <option value='매도'>매도</option>
                </select>
                
                <button id='addTrBtn' onclick="cmnEx.openPopup('add')">거래내역추가</button>
            </div>
            <div id='datePicker'>
                <input type="text" name="start">
                <span>to</span>
                <input type="text" name="end">  
            </div>
            <button id='trSearchBtn'>검색</button>
            <table class='layerTable'>
                <thead>
                    <td onclick="cmnEx.sort('assetNm')">종목명</td>
                    <td>수량</td>
                    <td>거래유형</td>
                    <td>단가</td>
                    <td>금액</td>
                    <td>비용</td>
                    <td onclick="cmnEx.sort('date')">일자</td>
                </thead>
                <tbody id='trRecordF'>
                    
                </tbody>
            </table>`;

        const elem = document.getElementById('datePicker');
        const rangepicker = new DateRangePicker(elem, {
            autohide : true,
            format : 'yyyy/mm/dd',
            clearBtn : true,
        }); 
        await cmnEx.gridSelectList();
        await cmnEx.gridTrDetail();
        ctrl.addSearchEvent();
        ctrl.addTrBtnEvent();
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
        paramData['startDate'] = document.getElementsByClassName('datepicker-input')[0]['value'] ?? '';
        paramData['endDate'] = document.getElementsByClassName('datepicker-input')[1]['value'] ?? '';

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
            let nowTot = args[2];
            await keywords[args[0]](assetNm, nowTot);
        } else if(args[0] === 'add') {
            await keywords[args[0]]();
        }
    },
    alert : async function(...args){
        let
        modalBg = document.getElementsByClassName('modal-bg')[0],
        modalWrap = document.getElementsByClassName('modal-wrap')[0];
        await new Promise(resolve => {
            let msg = args[0];
            let div = document.getElementsByClassName('popupDiv')[0];
            let title = document.getElementsByClassName('popupH1')[0];
            title.innerText = '';

            div.replaceChildren();

            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.height = '-webkit-fill-available';
            
            let p = document.createElement('p');
            p.style.left = 0;
            p.style.right = 0;
            p.style.marginLeft = 'auto';
            p.style.marginRight = 'auto';
            p.innerText = msg;

            div.appendChild(p);

            

            modalWrap.style.width = '50vw';
            modalWrap.style.height = '25vh';
            modalBg.style.display = '';
            modalWrap.style.display = '';
            resolve();
        });
    },
    addTr : async function(e){
        let paramData = new Object();
            paramData['assetNm'] = e['assetNm'];
            paramData['assetCatgNm'] = document.getElementById('popAssetCatg').value;
            paramData['trMethod'] = e['trMethod'] ?? '기타';
            paramData['trAmt'] = (e['trAmt'] ?? 0).toString();
            paramData['trPrice'] = (e['trPrice'] ?? 0).toString();
            paramData['trTotprice'] = (e['trTotprice'] ?? 0).toString();
            paramData['trCost'] = (Number(e['fee'] ?? 0) + Number(e['tax'] ?? 0)).toString();
            paramData['trResult'] = (e['result'] ?? 0).toString();
            paramData['trEarnrate'] = (e['earnrate'] ?? 0).toString();
            paramData['trDate'] = e['trDate'].toString();
            console.log(paramData);
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
        document.getElementById('insertBtn').addEventListener('click',function(){
            if(datas['cols'] && datas['cols'].length > 0){
                datas['cols'].forEach( async e => {
                    await cmnEx.addTr(e);

                    if(datas['pasteKey'].includes('주식')){
                        await cmnEx.getSummary();
                        let assetCatgNm;
                        let fltAsset = datas['trRecord']['voList'].filter(x => x.assetNm === e['assetNm']);
                        if(fltAsset){
                            assetCatgNm = fltAsset[0]['assetCatgNm'];
                            console.log(assetCatgNm);
                        }
                        //거래내역 변경 후 자산정보 변경
                        cmnEx.makeDataForUpdate();
                    }
                })
            }
        })
        //데이터 복붙시 정리이벤트
        document.getElementsByClassName('trRecords')[0].addEventListener('keyup', function(e){
            datas['workPasted'] = e['target']['value'];
            datas['rows'] = datas['workPasted'].split(' ');
            let key = datas['rows'][0];
            datas['pasteKey'] = key;
            //입력받은 데이터 가공
            try{
                cmnEx.workPastedData(key);
            }catch(E){
                console.log(E);
            }
        })
        return new Promise(resolve => resolve());
    },
    workPastedData : function(key){
        if(key.includes("주식")){
            datas['workPasted'] = datas['workPasted'].replace(key, '');
            let filtered = datas['workPasted'];
            if(filtered.match('KODEX 200')){
                filtered = filtered.replaceAll('KODEX 200', 'KODEX_200');
            }
            if(filtered.match('TIGER KRX BBIG K-뉴')){
                filtered = filtered.replaceAll('TIGER KRX BBIG K-뉴?', 'TIGER_KRX_BBIG_K-뉴딜');
            }
            datas['rows']= filtered.split(' ');
            datas['rows']= datas['rows'].splice(1, datas['rows'].length -1); //맨앞 키 있던자리 제거
            datas['cols'] = new Array();
            datas['rows'].forEach(e => {
                let temp = new Object();
                let colHs = ['trDate', 'assetNm', '구분', 'trMethod', 'trAmt', 'trPrice', 'buyPrice', 'sellTotPrice', 'buyTotPrice', 'fee', 'tax',  'result', 'earnrate']
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
                try{

                
                let needFix = ['trAmt', 'trPrice', 'buyPrice', 'sellTotPrice', 'buyTotPrice', 'fee', 'tax', 'result'];
                
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
                } catch(e){
                    throw new Error(`error : ${e}`)
                }
            })
        } else if(key.includes("배당")){
            datas['workPasted'] = datas['workPasted'].replace(key, '');
            let filtered = datas['workPasted'];
            if(filtered.match('KODEX 200')){
                filtered = filtered.replaceAll('KODEX 200', 'KODEX_200');
            }
            if(filtered.match('TIGER KRX BBIG K-뉴')){
                filtered = filtered.replaceAll('TIGER KRX BBIG K', 'TIGER_KRX_BBIG_K');
            }
            if(filtered.match('배당금 입금')){
                filtered = filtered.replaceAll('배당금 입금', '배당금_입금');
            }
            datas['rows'] = filtered.split(' ');
            datas['rows'] = datas['rows'].splice(1, datas['rows'].length -1);
            datas['cols'] = new Array();
            datas['rows'].forEach(e => {
                let temp2 = new Object();
                let colHs = ['trDate', 'assetNm', 'trMethod', 'trTotprice'];
                let cols = e.split('\t');
                cols.forEach((col, idx) => {
                    temp2[colHs[idx]] = col;
                })
                datas['cols'].push(temp2);
            });

            datas['cols'].forEach(async e => {
                //datas['cols'] 데이터 정리
                Object.keys(e).forEach(key => {
                    //이름에 언더바 들어간 항목 제거
                    if(key === 'assetNm' && e[key].includes('_')){
                        e[key] = e[key].replaceAll('_', ' ');
                    }
                    if(key === 'trMethod' && e[key].includes('_')){
                        e[key] = e[key].replaceAll('_', ' ');
                    }
                })
            })

            datas['cols']['assetCatgNm'] = 0;
            datas['cols']['trAmt'] = 0;
            datas['cols']['trPrice'] = 0;
            datas['cols']['trCost'] = 0;
            datas['cols']['trResult'] = 0;
            datas['cols']['trEarnrate'] = 0;
        }
    },
    makeDataForUpdate : function(){
        let temp = new Array();
        datas['summary'].forEach(e => {
            let paramData = new Object();
            paramData['assetNm'] = e['assetNm'];
            paramData['assetCatgNm'] = datas['trInfo']['voList'].filter(x => x.assetNm === e['assetNm'])[0]['assetCatgNm'];
            paramData['assetAmt'] = e['buyAmt'] - e['sellAmt'];
            paramData['assetTotprice'] = (e['buyTotalP'] - e['buyCost']) - (e['sellTotalP'] - e['sellCost']);
            paramData['assetPrice'] = Math.round(paramData['assetTotprice'] / paramData['assetAmt']) ;

            paramData['assetAmt'] = paramData['assetAmt'].toString();
            paramData['assetTotprice'] = paramData['assetTotprice'].toString();
            paramData['assetPrice'] = paramData['assetPrice'].toString();
            if(paramData['assetAmt'] > 0){
                temp.push(paramData);
            }
        })
        datas['updateData'] = temp;
        datas['updateData'].forEach(e => {
            cmnEx.updateAsset(e);
        })
    },
    updateAsset : async function(paramData){
        await fetchData('POST', 'updateAsset', paramData);
    },
    popAssetDetail : async function(assetNm ,nowTot){
        let div = document.getElementsByClassName('popupDiv')[0];
        let title = document.getElementsByClassName('popupH1')[0];
        title.innerText = '자산 상세';

        let base = datas['summary'].filter(x => x.assetNm === assetNm)[0];
        let info = datas['myAssetInfo']['voList'].filter(x => x.assetNm === assetNm)[0];;
        let haveAmt = base['buyAmt'] - base['sellAmt'];
        let trResult = (base['buyTotalP'] + base['buyCost']) - (base['sellTotalP'] - base['sellCost']);
        let realInput = Number(nowTot.replaceAll(',', ''));

        let totDividend = datas['summaryDividend'].filter(x => x.assetNm === assetNm);
        let totalEarn = base['totalEarn'];

        div.innerHTML = `
        <table>
            <tbody>
                <tr>
                    <td>자산이름</td><td>${base['assetNm']}</td>
                </tr>
                <tr>
                    <td>현재보유량</td><td>${haveAmt.toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>현재단가</td><td>${(info['assetNowAvg']).toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>실질투입금액</td><td>${trResult.toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>실제표기 매수금액</td><td>${realInput.toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>배당금</td><td>${totDividend[0]['totP'].toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>기록손익</td><td>${(base['sellTotResult']).toLocaleString('ko-KR')}</td>
                </tr>
            </tbody>
        </table>
        <!--
        <p>*실표기 매수금액 : (매수총액 - 매수비용) - (매도총액 - 매도비용) + 기록손익</p>
        <p>*도중손익 : ((매수평균 - 매도평균) * 보유량) - 총비용 + 배당금</p>
        
        <p>*도중손익을 키우려면 (매수평균 - 매도평균)의 값을 키워야 한다</p>
        -->
        <br>
        <p>거래이력</p>
        <p>실제 총 실현손익 : <strong id="realRslt"></strong></p>
        <br>
        <table>
            <thead>
                <tr>
                    <th>수량</th><th>단가</th><th>조정단가</th><th>투입금</th><th>손익</th><th>일자</th><th>실현손익</th>
                    <th>보유량</th><th>보유단가</th><th>매수금액</th>
                </tr>
            </thead>
            <tbody id="histField"></tbody>
        </table>`;
        let thisAssetTrHist = datas['allTrHist']['voList'].filter(x => x.assetNm === assetNm);
        if(thisAssetTrHist.length > 0){
            let globalAmt = 0, globalPrc = 0, globalTot = 0, gRealProfit = 0;
            thisAssetTrHist.forEach((e, idx) => {
                let tr = document.createElement('tr');
                let aNm = e['assetNm'];
                let amt = Number(e['assetAmt']);
                let prc = Number(e['assetPrice']);
                let tot = Number(e['assetTotprice']);
                let rslt = Number(e['trResult']);

                globalAmt += amt;
                globalTot += tot;
                globalPrc = Math.round(globalTot/globalAmt);
                if(isNaN(globalPrc)) globalPrc = 0;
                tr.innerHTML = `
                <td class='price'>${amt.toLocaleString('ko-KR')}</td>
                <td class='price'>${prc.toLocaleString('ko-KR')}</td>
                <td class='price' id="${aNm}${idx}"></td>
                <td class='price'>${tot.toLocaleString('ko-KR')}</td>
                <td class='price'>${rslt.toLocaleString('ko-KR')}</td>
                <td>${e['histPeriodEnd']}</td>
                <td class='price' id="tr${idx}"></td>
                <td class='price'>${globalAmt.toLocaleString('ko-KR')}</td>
                <td class='price' id="gPrc${idx}">${globalPrc.toLocaleString('ko-KR')}</td>
                <td class='price'>${globalTot.toLocaleString('ko-KR')}</td>
                `;
                document.getElementById(`histField`).appendChild(tr);

                if(amt > 0){
                    //증가
                    let rPrc = Math.round(tot/amt);
                    document.getElementById(`${aNm}${idx}`).innerText = rPrc.toLocaleString('ko-KR');
                } else if(amt < 0) {
                    let rPrc = Math.round(Math.abs(tot)/Math.abs(amt));
                    document.getElementById(`${aNm}${idx}`).innerText = rPrc.toLocaleString('ko-KR');

                    // (매도단가 - 직전보유단가) * 매도수량 = 실현손익
                    let hPrc = Number(document.getElementById(`gPrc${idx}`).innerText.replaceAll(',', ''));
                    let rsltR = '';
                    if(globalAmt === 0 || isNaN(hPrc)){
                        hPrc = 0;
                        document.getElementById(`gPrc${idx}`).innerText = '';
                        rsltR = Math.abs(globalTot);
                    } else {
                        rsltR = (rPrc - hPrc) * Math.abs(amt);
                    }
                    gRealProfit += rsltR;
                    document.getElementById(`tr${idx}`).innerText = rsltR.toLocaleString('ko-KR');
                }


                document.getElementById(`realRslt`).innerText = (gRealProfit + totDividend[0]['totP']).toLocaleString('ko-KR');
            })
        }
        
        return new Promise(resolve => resolve());
    },
    getSummary : async function(period){
        let detailInfo = await cmnEx.calBasicInfo(period);
        
        if(period){
            datas['summaryPrd'] = detailInfo;
        } else {
            datas['summary'] = detailInfo;
        }
        return new Promise(resolve => resolve());
    },
    calBasicInfo :async function(period){
        let result = new Array();
        datas['assetNms'].forEach(async e => {
            let assetNm = e;
            let  detailInfo = new Object();
            if(!period){
                detailInfo['base'] = datas['trInfo']['voList'].filter(x => x.assetNm === assetNm);
            } else {
                detailInfo['base'] = datas['trInfoPeriod']['voList'].filter(x => x.assetNm === assetNm);
            }
            await doubleToInt(detailInfo['base'], 'N');
            detailInfo['assetNm'] = assetNm;
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
            detailInfo['sellTotResult'] = getSum([...detailInfo['sellInfo'].map(x => x.trResult)]);

            delete detailInfo['base'];
            delete detailInfo['buyInfo'];
            delete detailInfo['sellInfo'];
            
            let assetInfo = datas['myAssetInfo']['voList'].filter(x => x.assetNm === assetNm)[0] ?? {assetTotprice : 0, assetNowTotal : 0};
            let thisDividend;
            if(!period){
                await cmnEx.getDividendInfo();
                thisDividend = datas['summaryDividend'].filter(x => x.assetNm === assetNm)[0];
            } else {
                await cmnEx.getDividendInfo(period);
                thisDividend = datas['summaryDividendPrd'].filter(x => x.assetNm === assetNm)[0];
            }
            thisDividend = thisDividend?.['totP'] ?? 0;
            detailInfo['totDividend'] = thisDividend;
            detailInfo['totCost'] = detailInfo['buyCost'] + detailInfo['sellCost'];

            if(!period){
                if(assetInfo['assetNowTotal']){
                    assetInfo['assetNowTotal'] = Number((assetInfo?.['assetNowTotal']).replaceAll(',', ''));
                }
                if(assetInfo['assetTotprice']){
                    assetInfo['assetTotprice'] = Number((assetInfo?.['assetTotprice']).replaceAll(',', ''));
                }
            }

            let totCost = detailInfo['buyCost'] - detailInfo['sellCost'];
            let totalAmt = detailInfo['buyAmt'] - detailInfo['sellAmt'];
            let diffAvgP = detailInfo['sellAvgP'] - detailInfo['buyAvgP'];
            let totResult = detailInfo['sellTotResult'];
            let assetInfoR = assetInfo['assetNowTotal'] - assetInfo['assetTotprice'];
            let totalEarn = (totalAmt * diffAvgP) - totCost + thisDividend;
            
            detailInfo['totalEarn'] = totalEarn;
            result.push(detailInfo);
        })
        return new Promise(resolve => resolve(result));
    },

    getDividendInfo : async function(period){
        if(period){
            datas['diviInfoPrd'] = datas['trInfoPeriod']['voList'].filter(x => x.trMethod === '배당금 입금');
            makeDividinfo(datas['diviInfoPrd'], period);
        }else {
            datas['dividendInfo'] = datas['trInfo']['voList'].filter(x => x.trMethod === '배당금 입금');
            makeDividinfo(datas['dividendInfo']);
        }
        
        return new Promise(resolve => resolve());
    }
}
function makeDividinfo(arr, period){
    let nms = new Array();
        
    arr.forEach(e => {
        Object.keys(e).forEach(key => {
            if(!e[key]){
                delete e[key];
            }
        })
        nms = arr.map(m => m.assetNm)
        nms = [... new Set(nms)];
    })

    let temp = new Array();
    nms.forEach(e => {
        let tempObj = new Object();
        let sum = 0;
        let target = arr.filter(x => x.assetNm === e);

        target.forEach(t => {
            sum += t.trTotprice;
        })

        tempObj['assetNm'] = e;
        tempObj['totP'] = sum;
        temp.push(tempObj);
    })

    if(!period){
        datas['summaryDividend'] = temp;
    } else {
        datas['summaryDividendPrd'] = temp;
    }
}
function doubleToInt(arr, opt){
    let regex = /[^0-9]/g;
    Array.from(arr).filter(x => x.assetCatgNm === '주식').forEach(e => {
        if(!e){
            return false;
        }
        Object.keys(e).forEach(x => {
            if(e[x] && e[x].length > 0 && x !== 'trDate' && x !== 'assetNm' && x !== 'assetCatgNm'){
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
function strToNum(obj){
    Object.keys(obj).forEach(key => {
        if(key !== 'assetNm'){
            obj[key] = Number(obj[key]);
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

function sortArr(arr, sortType){
    arr.sort(function(a, b){
        if(sortType === 'desc'){
            //내림차순 정렬
            if(a > b) return -1;
            if(a < b) return 1;
            else return 0;
        } else if(sortType === 'asc'){
            //오름차순 정렬
            if(a > b) return 1;
            if(a < b) return -1;
            else return 0;
        }
    })
}

function isSameArr(arr1, arr2){
    //두 배열의 길이가 다르면
    if(arr1.length !== arr2.length){
        return false;
    } 
    // 길이가 같은 경우 비교
    else if(arr1.length === arr2.length){
        let filter = arr1.filter(x => arr2.includes(x));
        console.log(filter);
        if(filter.length === arr1.length){
            return true;
        } else return false;
    }
}

async function makeForHist(){
    let stdt = document.getElementsByClassName('datepicker-input')[0]['value'] ?? '';
    let enddt = document.getElementsByClassName('datepicker-input')[1]['value'] ?? '';
    console.log(`시작일 : ${stdt}, 종료일 : ${enddt}`);
    stdt = stdt.split('/');
    stdt[2] = '01';
    stdt = stdt.join('/');
    console.log(`수정시작일 : ${stdt}`);
    datas['trHist'] = await fetchData('POST', 'getTrHistInfo', {histPeriodStart : stdt, histPeriodEnd : enddt});
    if(datas['trHist']['voList'].length > 0){
        console.log('이미 등록된 구간입니다.');
        return false;
    }
    let target = datas['summaryPrd'];
    if(target && target.length > 0){
        datas['test'] = new Array();
        target.forEach(async e => {
            if(e['buyTotalP'] !== 0 || e['sellTotalP'] !== 0){
                let amt = Number(e['buyAmt']) - Number(e['sellAmt']);
                let totPrc = Number(e['buyTotalP']) - Number(e['sellTotalP']);
                let prc = Number.parseInt((e['buyAvgP'] + e['sellAvgP']) / 2);
                if(isNaN(prc)){
                    if(e['buyAmt'] === 0){
                        prc = e['sellAvgP'];
                    } else if(e['sellAmt'] === 0){
                        prc = e['buyAvgP'];
                    } else {
                        prc = 0;
                    }
                }
                let paramData = {
                    assetNm : e['assetNm'],
                    assetAmt : amt,
                    assetTotprice : totPrc,
                    assetPrice : prc,
                    trResult : Number(e['sellTotResult']),
                    assetDividend : Number(e['totDividend']),
                    assetCatgNm : _assetCatg,
                    histPeriodStart : stdt,
                    histPeriodEnd : enddt,
                }
                Object.keys(paramData).forEach((x, idx) => {
                    paramData[x] = paramData[x].toString();
                })
                datas['test'].push(paramData);
                
                await fetchData('POST', 'writeTrHist', paramData);
            }
        })
    }
}