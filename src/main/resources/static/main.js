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
    //cmnEx.alert('todo : 매매정보 heaer 클릭시 정렬기능 필요.');
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
        return new Promise(resolve => resolve());
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
                    <td onclick="cmnEx.sort('name')">종목명</td>
                    <td onclick="cmnEx.sort('state')">현재상태</td> <!-- 청산, 보유 -->
                    <td onclick="cmnEx.sort('result')">거래결과</td>
                </thead>
                <tbody id='summaryTbody'>
                    
                </tbody>
            </table>
            `;
        /*내 자산정보*/
        datas['myAssetInfo']['voList'].forEach((e, idx) => {
            let tr = document.createElement('tr');
            let temp = datas['summary'].filter(f => f.assetNm === e.assetNm)[0];
            tr.innerHTML = 
                `<td onclick="cmnEx.openPopup('detail', '${e.assetNm}', '${e.assetNowTotal ?? e.assetTotprice}')" id="assetNm${idx}">${e.assetNm}</td>
                 <td class='price' id="assetAmt${idx}">${e.assetAmt}</td>
                 <td class='price' id="assetPrice${idx}" onclick="cmnEx.changeToNewP(this)">${e.assetNowAvg ?? e.assetPrice}</td>
                 <td class='price' id="assetTotprice${idx}" data-idx="${idx}" onclick="cmnEx.changeToInput(this)" data-value="${e.assetNowTotal ?? e.assetTotprice}" data-isOn="false" data-assetnm="${e.assetNm}">${e.assetNowTotal ?? e.assetTotprice}</td>`;
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
            } else if(state === '보유'){
                trResult = e['totalEarn'] ?? 0;
            }
            
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
        let amt = element.previousElementSibling.innerText;
        let tot = element.nextElementSibling.innerText;
        let assetNm = element.previousElementSibling.previousElementSibling.innerText;
        let avg = Math.ceil(tot/amt);

        let paramData = new Object();
        paramData['assetNm'] = assetNm;
        paramData['assetNowAvg'] = avg.toString();

        cmnEx.updateAsset(paramData);
        location.reload();
    },
    sort : function(...args){
        if(args[0] === 'name'){

        }
        if(args[0] === 'state'){}
        if(args[0] === 'result'){}
    },
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
                element.value = targetV;
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
                <button id='addTrBtn' onclick="cmnEx.openPopup('add')">거래내역추가</button>
            </div>
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
            paramData['assetTotprice'] = e['buyTotalP'] - e['sellTotalP'] + (e['buyCost'] + e['sellCost']);
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
        
        let haveAmt = base['buyAmt'] - base['sellAmt'];
        let trResult = base['buyTotalP'] - base['sellTotalP'];
        let realInput = Number(nowTot.replaceAll(',', ''));
        
        let totCost = base['sellCost'] + base['buyCost'];
        let totDividend = datas['summaryDividend'].filter(x => x.assetNm === assetNm);
        let totalEarn = base['totalEarn'];

        datas['dividendTot'] = totDividend;
        
        div.innerHTML = `
        <table>
            <tbody>
                <tr>
                    <td>자산이름</td><td>${base['assetNm']}</td>
                </tr>
                <tr>
                    <td>매수수량</td><td>${base['buyAmt'].toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>매수단가</td><td>${base['buyAvgP'].toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>매수총액</td><td>${base['buyTotalP'].toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>매도수량</td><td>${base['sellAmt'].toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>매도단가</td><td>${base['sellAvgP'].toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>매도총액</td><td>${base['sellTotalP'].toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>현재보유량</td><td>${haveAmt.toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>현재매수단가</td><td>${(Math.round(trResult / haveAmt)).toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>실질투입금액</td><td>${trResult.toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>실제표기 매수금액</td><td>${realInput.toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>총 거래비용</td><td>${totCost.toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>배당금</td><td>${totDividend[0]['totP'].toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>손익</td><td>${(totalEarn).toLocaleString('ko-KR')}</td>
                </tr>
            </tbody>
        </table>`;

        return new Promise(resolve => resolve());
    },
    getSummary : async function(){
        let detailInfo = await cmnEx.calBasicInfo();
        datas['summary'] = detailInfo;
        return new Promise(resolve => resolve());
    },
    calBasicInfo :async function(){
        let result = new Array();
        datas['assetNms'].forEach(async e => {
            let assetNm = e;
            let  detailInfo = new Object();
            detailInfo['base'] = datas['trInfo']['voList'].filter(x => x.assetNm === assetNm);
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
            /*
            detailInfo['buyAmt'] = detailInfo['buyAmt'];
            detailInfo['buyTotalP'] = detailInfo['buyTotalP'];
            detailInfo['buyAvgP'] = detailInfo['buyAvgP'];
            detailInfo['sellAmt'] = detailInfo['sellAmt'];
            detailInfo['sellTotalP'] = detailInfo['sellTotalP'];
            detailInfo['sellAvgP'] = detailInfo['sellAvgP'];
            */
            await cmnEx.getDividendInfo();
            let assetInfo = datas['myAssetInfo']['voList'].filter(x => x.assetNm === assetNm)[0] ?? {assetTotprice : 0, assetNowTotal : 0};
            let thisDividend = datas['summaryDividend'].filter(x => x.assetNm === assetNm)[0];
            thisDividend = thisDividend?.['totP'] ?? 0;
            detailInfo['totDividend'] = thisDividend;
            detailInfo['totCost'] = detailInfo['buyCost'] + detailInfo['sellCost'];

            
            
            if(assetInfo['assetNowTotal']){
                assetInfo['assetNowTotal'] = Number((assetInfo?.['assetNowTotal']).replaceAll(',', ''));
            }
            if(assetInfo['assetTotprice']){
                assetInfo['assetTotprice'] = Number((assetInfo?.['assetTotprice']).replaceAll(',', ''));
            }
            

            let totCost = detailInfo['sellCost'] + detailInfo['buyCost'];
            let totalAmt = detailInfo['buyAmt'] - detailInfo['sellAmt'];
            let diffAvgP = detailInfo['sellAvgP'] - detailInfo['buyAvgP'];
            let totResult = detailInfo['sellTotResult'];
            let assetInfoR = assetInfo['assetNowTotal'] - assetInfo['assetTotprice'];
            let totalEarn = (totalAmt * diffAvgP) - totCost + thisDividend + totResult; //실현손익정보 포함시켜야함
            
            detailInfo['totalEarn'] = totalEarn;
            result.push(detailInfo);
        })
        return new Promise(resolve => resolve(result));
    },

    getDividendInfo : async function(){
        datas['dividendInfo'] = datas['trInfo']['voList'].filter(x => x.trMethod === '배당금 입금');
        let nms = new Array();
        
        datas['dividendInfo'].forEach(e => {
            Object.keys(e).forEach(key => {
                if(!e[key]){
                    delete e[key];
                }
            })
            nms = datas['dividendInfo'].map(m => m.assetNm)
            nms = [... new Set(nms)];
        })

        let temp = new Array();
        nms.forEach(e => {
            let tempObj = new Object();
            let sum = 0;
            let target = datas['dividendInfo'].filter(x => x.assetNm === e);

            //let summary = datas['summary'].filter(x => x.assetNm === e)[0];

            target.forEach(t => {
                sum += t.trTotprice;
            })

            tempObj['assetNm'] = e;
            tempObj['totP'] = sum;
            //summary['totDividend'] = sum;
            temp.push(tempObj);
        })

        datas['summaryDividend'] = temp;
        return new Promise(resolve => resolve(temp));
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

//b = [88, 5, 2, 33, 1, 6] //a = ['a', 'd', 'b', 'z', 'c']