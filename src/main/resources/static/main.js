const _rootPath = `${location.origin}/`;
let 
datas = new Object(),
_pageIndex = 1,
_pageUnit = 20,
sortType = 'asc',
sortNm = 'date',
savedPageIndex = 0,
_assetCatg = '주식',
template = new Object();
;
document.addEventListener('DOMContentLoaded', function(){
    ctrl.events();
    //cmnEx.alert('todo : 총손익 히스토리를 담는 테이블 구현 및 호출로직 필요');
})

function popupCloseEvent(){
    let modalBg = document.getElementsByClassName('modal-bg')[0];
    let modalWrap = document.getElementsByClassName('modal-wrap')[0];
    let div = document.getElementsByClassName('popupDiv')[0];
    div.style.display = '';
    div.style.alignItems = '';
    div.style.height = '';
    modalWrap.style.width = '80vw';
    modalWrap.style.height = '50vh';
    modalWrap.style.paddingLeft = '30px';
    modalWrap.style.paddingRight = '30px';
    modalBg.style.display = 'none';
    modalWrap.style.display = 'none';
}
let ctrl = {
    events : async function(){
        let tabcontents = document.getElementsByClassName('tabcontent')[0].children;
        tabcontents['tab01'].style.display = 'none';
        tabcontents['tab02'].style.display = '';
        await cmnEx.getMainInfos();
        await cmnEx.gridMyAssetInfo();
        await cmnEx.gridTrFrame();
        getLatestSise();

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
            popupCloseEvent();
        })
        document.getElementsByClassName('modal-bg')[0].addEventListener('click', function(){
            let modalBg = document.getElementsByClassName('modal-bg')[0];
            let modalWrap = document.getElementsByClassName('modal-wrap')[0];
            let div = document.getElementsByClassName('popupDiv')[0];
            div.style.display = '';
            div.style.alignItems = '';
            div.style.height = '';
            modalWrap.style.width = '80vw';
            modalWrap.style.height = '50vh';
            modalWrap.style.paddingLeft = '30px';
            modalWrap.style.paddingRight = '30px';
            modalBg.style.display = 'none';
            modalWrap.style.display = 'none';
        })

        document.addEventListener('scroll', function(){
            let scrollTot = document.body.scrollHeight;
            let midPoint = scrollTot * 0.3;
            let nowPoint = document.documentElement.scrollTop;
            let toRemove = document.getElementById('goToTop');
            if(nowPoint > midPoint){
                if(!toRemove){
                    let btn = document.createElement('button');
                    btn.className= 'button1';
                    btn.innerText = '맨위로';
                    btn.id = 'goToTop';
                    document.getElementsByClassName('buttonF')[0].appendChild(btn);

                    document.getElementById(btn.id).addEventListener('click', function(){
                        document.documentElement.scrollTo(0,0)
                    }, true)
                }
                
            } else {
                if(toRemove){
                    toRemove.remove();
                }
            }
        }, true);
    },
    moreBtnEvent : function(){
        //더보기
        document.getElementById('moreBtn').addEventListener('click',async function(){
            _pageIndex ++;
            sortType = sortType ?? 'asc';
            Array.from(document.getElementsByClassName('datepicker-input')).forEach(e => e.value = '');
            await cmnEx.getMoreTrList();
            await cmnEx.gridTrDetail('more');
        }, true);
    },
    addSearchEvent : function(){
        document.getElementById('trSearchBtn').addEventListener('click', async function(){
            _pageIndex = 1;
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
        if(document.getElementsByName('catgBtn1').length === 0){
            return false;
        }
        document.getElementsByName('catgBtn1').forEach(e => {
            e.addEventListener('click', function(element){
                _assetCatg = element.target.innerText;
                
                console.log('clicked tab01');
            })
        })
        if(document.getElementsByName('catgBtn2').length === 0){
            return false;
        }
        document.getElementsByName('catgBtn2').forEach(e => {
            e.addEventListener('click', function(element){
                _assetCatg = element.target.innerText;
                
                console.log('clicked tab02');
            })
        })
    },

    /**
     * 자산정보 업데이트 버튼 
     */
    updateMyAsset : function(){
        document.getElementById('updateMyAssetBtn').addEventListener('click', async function(){
            cmnEx.updateNRedrawMyAsset();
        })
    }
}

let cmnEx = {
    /**
     * 주요정보 불러오기
     */
    getMainInfos : async function(){
        datas['sumData'] = new Array();
        datas['trRecord'] = await fetchData('POST', 'getListOpt');
        datas['myAssetInfo'] = await fetchData('POST', 'getMyAssetInfo');
        datas['trInfo'] = await fetchData('POST', 'getAllList');

        datas['assetNms'] = Array.from(datas['trInfo']['voList']).map(x => x['assetNm']);
        datas['assetNms'] = [...new Set(datas['assetNms'])];

        await doubleToInt(datas['myAssetInfo']['shareList']);
        await doubleToInt(datas['trRecord']['voList']);
        await cmnEx.getSummary();

        datas['allTrHist'] = await fetchData('POST', 'getTrHistEachInfo');
        calTrHist();

        datas['assetNms'].forEach(e => complexData(e));
        return new Promise(resolve => resolve());
    },

    /**
     * 더보기이벤트
     */
    getMoreTrList : async function(){
        let paramData = new Object();
        paramData['assetNm'] = document.getElementById('assetlist').value; //종목이름
        paramData['trMethod'] = document.getElementById('trcatg').value; //매수 매도 선택
        paramData['pageIndex'] = _pageIndex.toString();
        paramData['startDate'] = document.getElementsByClassName('datepicker-input')[0]['value'] ?? '';
        paramData['endDate'] = document.getElementsByClassName('datepicker-input')[1]['value'] ?? '';
        paramData['sortType'] = sortType;
        paramData['sortNm'] = sortNm;

        datas['trRecord'] = await fetchData('POST', 'getListOpt', paramData);
        if(paramData['startDate'] && paramData['endDate']){
            datas['trInfoPeriod'] = await fetchData('POST', 'getAllList', paramData);
            cmnEx.getSummary(paramData['startDate']);
        }
        await doubleToInt(datas['trRecord']['voList']);
        datas['eachTrHist'] = await fetchData('POST', 'getTrHistEachInfo', paramData);

        return new Promise(resolve => resolve());
    },

    /**
     * 보유자산 정보 그리기
     */
    gridMyAssetInfo : async function(){
        let target = document.getElementById('tab02');
        target.innerHTML = 
            `
            <div class='btn-group'>
                <button id='assetCatg1' name='catgBtn2'>주식</button>
                <button id='assetCatg2' name='catgBtn2'>코인</button>
                <button id='assetCatg3' name='catgBtn2'>골드</button>
            </div>
            <div class='titleDiv'>
                <h1 class='title'>내자산 정보</h1>
                <button class='rightBtn' id="updateMyAssetBtn">자산정보 업데이트</button>
            </div>
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
        ctrl.updateMyAsset();
        /*내 자산정보*/
        datas['myAssetInfo']['shareList'].forEach((e, idx) => {
            if(Number(e['assetAmt']) > 0){
                let tr = document.createElement('tr');
                tr.innerHTML = 
                    `<td onclick="cmnEx.openPopup('detail', '${e.assetNm}', '${e.assetNowTotal ?? e.assetTotprice}')" id="assetNm${idx}">${e.assetNm}</td>
                    <td class='price' id="assetAmt${idx}">${e.assetAmt}</td>
                    <td class='price' id="assetPrice${idx}" onclick="cmnEx.changeToNewP(this)">${e.assetNowAvg ?? e.assetPrice}</td>
                    <!--<td class='price' id="assetTotprice${idx}" data-idx="${idx}" onclick="cmnEx.changeToInput(this)" data-value="${e.assetNowTotal ?? e.assetTotprice}" data-isOn="false" data-assetnm="${e.assetNm}">${(e.assetNowTotal ?? e.assetTotprice).toLocaleString('ko-KR')}</td>-->
                    <td class='price' id="assetTotprice${idx}" data-idx="${idx}" data-assetnm="${e.assetNm}">${(e.assetNowTotal ?? e.assetTotprice).toLocaleString('ko-KR')}</td>`;
                document.getElementById('assetTbody').appendChild(tr);
            }
        })

        /*매매정보요약*/
        datas['sumData'].forEach(e => {
            let useData = e['result'];
            let tr = document.createElement('tr');
            let state = useData['rBAmt'] - useData['rSAmt'] > 0 ? '보유' : '청산';
            let thisDividend = useData['thisDividend'];
            let totOutput = useData['totOutput'];
            let trResult = totOutput + thisDividend;
            if(useData['trResult'] < 0){
                trResult = trResult + useData['trResult'];
            }
            useData['state'] = state;
            useData['assetNm'] = e['assetNm'];
            useData['printResult'] = state.includes("청산") ? useData['trResult'] + thisDividend : trResult;
        });
        sortTrSummary();
        //총계출력
        let sum = 0;
        Array.from(document.getElementsByName('trResult')).forEach(e => {
            sum += Number(e.innerText.replaceAll(',', ''));
        })

        let h2 = document.createElement('h2');
        h2.innerHTML = `총계 : ${sum.toLocaleString('ko-KR')}원`;
        document.getElementById('tab02').appendChild(h2);
        document.querySelectorAll('[class=btn-group]').forEach(e => e.style.display='none');
        return new Promise(resolve => resolve());
    },
    makeTrSummaryHTML : function(arr){
        document.getElementById('summaryTbody').innerHTML = '';
        console.log(`makeTrSummaryHTML : arr`, arr);
        arr.forEach((e, idx) => {
            let useData = e;
            let tr = document.createElement('tr');
            let state = useData['rBAmt'] - useData['rSAmt'] > 0 ? '보유' : '청산';
            let trResult = useData['printResult'].toLocaleString('ko-KR');
            let totPrice = useData['nowTot']
            tr.innerHTML = 
            `
            <!--<td>${e['assetNm']}</td>-->
            <td onclick="cmnEx.openPopup('detail', '${e.assetNm}', '${totPrice}')" id="assetNm${idx}">${e.assetNm}</td>
            <td>${state}</td>
            <td class='price' name="trResult">${trResult}</td>
            `
            document.getElementById('summaryTbody').appendChild(tr);
        });
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

    /**
     * 셀렉트박스에 종목이름 넣기
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

    /**
     * 거래내역 그리기
     */
    gridTrFrame : async function(){
        let target = document.getElementById('tab01');
        target.innerHTML = `
        <div class='btn-group'>
            <button id='assetCatg1' name='catgBtn1'>주식</button>
            <button id='assetCatg2' name='catgBtn1'>코인</button>
            <button id='assetCatg3' name='catgBtn1'>골드</button>
        </div>
        <div class='layerTable'>
            <select name='assets' id='assetlist'>
                <option value=''>--자산을 선택해주세요--</option>
            </select>
            <select name='assets' id='trcatg'>
                <option value=''>전체</option>
                <option value='매수'>매수</option>
                <option value='매도'>매도</option>
            </select>
            
            
            <div id='datePicker'>
                <input type="text" name="start">
                <span>to</span>
                <input type="text" name="end">  
            </div>
        </div>
        <button class="button2" id='addTrBtn' onclick="cmnEx.openPopup('add')">거래내역추가</button>
        <button class="button2" id='trSearchBtn'>검색</button>
        <table class='layerTable'>
            <thead>
                <td class="assetNm" onclick="cmnEx.sort('assetNm')">종목명</td>
                <td class="amt">수량</td>
                <td class="catg">유형</td>
                <td class="price">단가</td>
                <td class="total">금액</td>
                <td class="cost">비용</td>
                <td class="date" onclick="cmnEx.sort('date')">일자</td>
            </thead>
            <tbody id='trRecordF'>
                
            </tbody>
        </table>`;
            
            let div = document.createElement('div');
            div.className = 'buttonF';
            div.innerHTML = 
            `<button class="button1" id="moreBtn">더보기</button>
            <!--<button class="button1" id="alertBtn">alert</button>-->`;
            target.appendChild(div);
            
        const elem = document.getElementById('datePicker');
        const rangepicker = new DateRangePicker(elem, {
            autohide : true,
            format : 'yyyy/mm/dd',
            clearBtn : true,
            language : 'kr',
        }); 
        await cmnEx.gridSelectList();
        await cmnEx.gridTrDetail();
        ctrl.addSearchEvent();
        ctrl.addTrBtnEvent();
        ctrl.moreBtnEvent();
        //datas['assetNms'].forEach(e => complexData(e));
        document.querySelectorAll('[class=btn-group]').forEach(e => e.style.display='none');
        return new Promise(resolve => resolve());
    },
    /**
     * 내 자산정보 데이터 업데이트 후 다시 그리기
     */
    updateNRedrawMyAsset : async function(){
        await cmnEx.makeDataForUpdate();
        datas['myAssetInfo'] = await fetchData('POST', 'getMyAssetInfo');
        await doubleToInt(datas['myAssetInfo']['shareList']);
        console.log(`update myAssetInfo is completed`);
        console.log(datas['myAssetInfo']);

        cmnEx.gridMyAssetInfo();
    },
    /**
     * 거래내역 추가용 팝업이벤트
     */
    gridAddTrFrame : async function(){
        let div = document.getElementsByClassName('popupDiv')[0];
        let title = document.getElementsByClassName('popupH1')[0];
        title.innerText = '거래내역 추가';
        div.innerHTML = `
        <select name='assets' id='popAssetCatg'>
            <option value=''>--자산을 선택해주세요--</option>
        </select>
        <textarea class='trRecords' placeholder = '내용을 입력해주세요' style='display:none;'></textarea>
        <button class='popBtn' id='insertBtn'>입력</button>`;
        /*
        datas['trInfo']['assetCatg'].forEach(e => {
            let opt = document.createElement('option');
            opt.value = e['assetCatgNm'];
            opt.innerText = e['assetCatgNm'];
            document.getElementById('popAssetCatg').appendChild(opt);
        })
        */
        const catgs = {trRecord : '주식', dividend : "배당금 입금"};
        Object.keys(catgs).forEach(e => {
            let opt = document.createElement('option');
            opt.value = e;
            opt.innerText = catgs[e];
            document.getElementById('popAssetCatg').appendChild(opt);
        })
        //드롭박스 값 입력
        document.getElementById(`popAssetCatg`).addEventListener('change', function(e){
            document.getElementsByClassName('trRecords')[0].style.display = '';
            /*
            console.log(this.value);
            if(this.value === '주식'){
                document.getElementsByClassName('trRecords')[0].style.display = '';
            }*/
        })
        //입력이벤트
        document.getElementById('insertBtn').addEventListener('click',function(){
            if(datas['cols'] && datas['cols'].length > 0){
                datas['cols'].forEach( async e => {
                    if(typeof(e['trTotprice']) === 'string' && e['trTotprice'].includes(",")){
                        e['trTotprice'] = Number(e['trTotprice'].replace(',', ''));    
                    } else e['trTotprice'] = Number(e['trTotprice']);

                    await cmnEx.addTr(e);
                    if(datas['pasteKey'].includes('trRecord')){// /trRecord
                    //if(datas['pasteKey'].includes('주식')){
                        //거래내역 변경 후 자산정보 변경
                        await cmnEx.getSummary().then(async data => {
                        if(data){
                            //거래내역 추가 후 이벤트
                            await cmnEx.updateNRedrawMyAsset();
                            
                            datas['allTrHist'] = await fetchData('POST', 'getTrHistEachInfo');
                        }
                        }).catch(E => {
                            console.error(E);
                        })
                    }
                })
            }
        })
        //데이터 복붙시 정리이벤트
        document.getElementsByClassName('trRecords')[0].addEventListener('keyup', async function(e){
            datas['workPasted'] = e['target']['value'];
            datas['rows'] = datas['workPasted'].split(' ');
            let key = document.getElementById(`popAssetCatg`).value;//datas['rows'][0];
            datas['pasteKey'] = key;
            //입력받은 데이터 가공
            try{
                await cmnEx.workPastedData(key);
                
            }catch(E){
                console.log(E);
            }
        })
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
    gridTrDetail : async function(key){
        if(key !== 'more'){
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
        } else {
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
        }
        
        
        return new Promise(resolve => resolve());
    },
    /** 팝업 분기처리*/
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
    /**
     * 커스텀alert
     * @param  {string} msg : 출력할 메세지
     */
    alert : async function(msg){
        let
        modalBg = document.getElementsByClassName('modal-bg')[0],
        modalWrap = document.getElementsByClassName('modal-wrap')[0];
        await new Promise(resolve => {
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
    /**
     * 거래내역 입력
     * @param {object} e : 자산정보 object
     * @returns 
     */
    addTr : async function(e){
        let paramData = new Object();
            paramData['assetNm'] = e['assetNm'];
            paramData['assetCatgNm'] = document.getElementById('popAssetCatg').value === 'trRecord' ? '주식' : '배당';
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
    /**
     * 엑셀에서 복사한 데이터 붙여넣기 시 동작하는 이벤트
     * @param {string} key : 엑셀 첫줄에 입력한 키워드 : 주식, 배당금 등
     * @returns 
     */
    workPastedData : function(key){
        if(key.includes("trRecord")){
        //if(key.includes("주식")){
            datas['workPasted'] = datas['workPasted'].replace(key, '');
            let filtered = datas['workPasted'];
            if(filtered.match('KODEX 200')){
                filtered = filtered.replaceAll('KODEX 200', 'KODEX_200');
            }
            if(filtered.match('TIGER KRX BBIG K-뉴')){
                filtered = filtered.replaceAll('TIGER KRX BBIG K-뉴?', 'TIGER_KRX_BBIG_K-뉴딜');
                filtered = filtered.replaceAll('TIGER KRX BBIG K-뉴', 'TIGER_KRX_BBIG_K-뉴딜');
                filtered = filtered.replaceAll('TIGER_KRX_BBIG_K-뉴딜딜', 'TIGER_KRX_BBIG_K-뉴딜');
            }
            /*
            datas['rows']= filtered.split(' ');
            datas['rows']= datas['rows'].splice(1, datas['rows'].length -1); //맨앞 키 있던자리 제거
            */
            datas['rows'] = filtered.split('\n');
            datas['cols'] = new Array();
            datas['rows'].forEach(e => {
                if(e !== ''){
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
                }
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
        } 
        else if(key.includes("dividend")){
        //else if(key.includes("배당")){
            /*배당금 데이터는 HTS 거래내역조회 기간설정 후 간편내역 체크한 상태로 엑셀로 내보내기 후
              1번째줄 배당
              칼럼순서 : 거래일자, 거래종류, 종목명, 거래금액만 남김
            */
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
            /*
            datas['rows'] = filtered.split(' ');
            datas['rows'] = datas['rows'].splice(1, datas['rows'].length -1);
            */
            datas['rows'] = filtered.split('\n');
            datas['cols'] = new Array();
            datas['rows'].forEach(e => {
                if(e !== ''){
                    let temp2 = new Object();
                    let colHs = ['trDate', 'trMethod', 'assetNm', 'trTotprice'];
                    let cols = e.split('\t');
                    cols.forEach((col, idx) => {
                        temp2[colHs[idx]] = col;
                    })
                    datas['cols'].push(temp2);
                }
                
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

        return new Promise(resolve => resolve());
    },
    /**
     * 변동데이터 db에 업데이트
     * @returns 
     */
    makeDataForUpdate : async function(){
        let temp = new Array();
        if(datas['summary'].length > 0){
            datas['summary'].forEach(e => {
                let paramData = new Object();
                paramData['assetNm'] = e['assetNm'];
                paramData['assetCatgNm'] = datas['trInfo']['voList'].filter(x => x.assetNm === e['assetNm'])[0]['assetCatgNm'];
                paramData['assetAmt'] = e['buyAmt'] - e['sellAmt'];
                paramData['assetTotprice'] = (e['buyTotalP'] - e['buyCost']) - (e['sellTotalP'] - e['sellCost']);
                paramData['assetPrice'] = Math.round(paramData['assetTotprice'] / paramData['assetAmt']) ;
                
                //infinite or NaN체크
                Object.keys(paramData).forEach(key => {
                    if(paramData[key] === Number.NEGATIVE_INFINITY || paramData[key] === Number.POSITIVE_INFINITY || Number.isNaN(paramData[key])){
                        paramData[key] = 0;
                    }
                })
                
                paramData['assetAmt'] = paramData['assetAmt'].toString();
                paramData['assetTotprice'] = paramData['assetTotprice'].toString();
                paramData['assetPrice'] = paramData['assetPrice'].toString();
                /*
                청산으로 인해 갯수가 0개가 되는 경우도 있으므로 주석처리
                if(paramData['assetAmt'] > 0){
                    temp.push(paramData);
                }
                */
               
                temp.push(paramData);
            })
            datas['updateData'] = temp;
            datas['updateData'].forEach(async e => {
                await cmnEx.updateAsset(e);
            })
        } else {
            //await cmnEx.getSummary();
            await cmnEx.makeDataForUpdate();
        }

        return new Promise(resolve => resolve());
    },
    updateAsset : async function(paramData){
        await fetchData('POST', 'updateAsset', paramData);
    },
    /**
     * 보유자산 클릭시 팝업오픈
     * @param {string} assetNm 
     * @param {number} nowTot 
     * @returns 
     */
    popAssetDetail : async function(assetNm ,nowTot){
        let div = document.getElementsByClassName('popupDiv')[0];
        let title = document.getElementsByClassName('popupH1')[0];
        title.innerText = '자산 상세';

        let base = datas['summary'].filter(x => x.assetNm === assetNm)[0];
        let realInput = Number(nowTot.replaceAll(',', ''));

        let useData = datas['sumData'].filter(x => x.assetNm === assetNm)[0];

        console.log(`팝업을 연다 : ${assetNm}`);
        let list = await getEachMonthData(assetNm);
        //console.log(list);
        console.log(useData);

        let remainAmt = useData['result']['remainA'], remainPrice = Math.round(realInput / useData['result']['remainA']); //보유단가는 실제 투입금액기준으로 산출해야함
        let remainTot = useData['result']['remainP'], totDiff = useData['result']['totDiff'], thisDividend = useData['result']['thisDividend'];

        //remainPrice !== accPrice !== nowTot... 원인파악필요

        div.innerHTML = `
        <table class="layerTable">
            <tbody>
                <tr>
                    <td>자산이름</td><td>${useData['assetNm']}</td>
                </tr>
                <tr>
                    <td>현재보유량</td><td>${remainAmt.toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>현재단가</td><td>${(remainPrice).toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>실질투입금액</td><td>${remainTot.toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>실제표기 매수금액</td><td>${realInput.toLocaleString('ko-KR')}</td>
                </tr>
                <tr>
                    <td>배당금</td><td>${thisDividend.toLocaleString('ko-KR')}</td>
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
        <table class="layerTable">
            <thead>
                <tr>
                    <th>일자</th><th>증감</th><!--<th>단가</th>-->
                    <th>조정단가</th><th>거래금액</th><!--<th>손익</th>--><th>실현손익</th>
                    <th>보유량</th><th>보유단가</th><th>실 투입금</th>
                </tr>
            </thead>
            <tbody id="histField"></tbody>
        </table>
        <figure class="highcharts-figure">
            <div id="container"></div>
        </figure>
        `;
        let accAmt = 0, accPrice = 0, accTot = 0, realEarn = 0;
        let rslt = useData['result']['trResult'];
        Object.keys(useData['data']).forEach(e => {
            let data = useData['data'][e];
            let amt = data['bAmt'] - data['sAmt'];
            let tot = data['totBP'] - data['totSP'] + (data['bCost'] + data['sCost']);
            let adjPrice = data['adjPrice'];
            let output = data['output'];
            let thisMRslt = data['trResult'];

            function filtNaNInfi(num){
                if(Number.isNaN(num) || !Number.isFinite(num)){
                    return 0;
                } else {
                    return num;
                }
            }
            accAmt = data['accAmt'];
            accTot = data['accTot'];
            accTot = accTot <= 0 ? 0 : accTot;
            accPrice = Math.round(filtNaNInfi(data['accPrice']));
            realEarn += output;
            adjPrice = filtNaNInfi(adjPrice) === 0 ? accPrice : adjPrice;

            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${e}</td>
                <td class='price'>${amt.toLocaleString('ko-KR')}</td>
                <td class='price'>${adjPrice.toLocaleString('ko-KR')}</td>
                <td class='price'>${tot.toLocaleString('ko-KR')}</td>
                <td class='price'>${output === 0 ? thisMRslt.toLocaleString('ko-KR') : output.toLocaleString('ko-KR')}</td>
                <td class='price'>${accAmt.toLocaleString('ko-KR')}</td>
                <td class='price'>${accPrice.toLocaleString('ko-KR')}</td>
                <td class='price'>${accTot.toLocaleString('ko-KR')}</td>
                `;
            document.getElementById('histField').appendChild(tr);
        });
        let finalTrResult = rslt > 0 ? useData['result']['totOutput'] + thisDividend : useData['result']['totOutput'] + thisDividend; //+ rslt; //이미 totOutput에 실현한 손실이 녹아있으므로 rslt 제거
        let txt = `${(finalTrResult).toLocaleString('ko-KR')}`;
        
        //이미 totOutput에 실현한 손실이 녹아있으므로 rslt 제거
        txt += `(실제손익 ${useData['result']['totOutput']} + 배당 ${thisDividend})`;
        
        if(useData['result']['state'].includes("청산")){
            finalTrResult = useData['result']['trResult'] + thisDividend;
            txt = `${(finalTrResult).toLocaleString('ko-KR')} (실제손익 ${useData['result']['trResult']} + 배당 ${thisDividend})`;
        }
        document.getElementById(`realRslt`).innerText = txt;

        //차트용
        let lastIdx = Object.keys(useData['data'])[Object.keys(useData['data']).length - 1];
        let y = Number(lastIdx.split('-')[0]);
        let m = Number(lastIdx.split('-')[1]);
        let dts = getFLDay(y, m);
        let lastDate = dts.lDay;
        let startDay = new Date('2021-08-01');
        let lastDay = new Date(`${lastIdx}-${lastDate}`);
        let monthDiff = inMonths(startDay, lastDay);
        let buyArr = new Array(monthDiff), sellArr = new Array(monthDiff);

        let sY = 2021, sM = 7; //default : 2021-8
        let firstDate = 0;
        Object.keys(useData['data']).forEach((e, idx) => {
            //최초거래일자 파악
            let stuff = useData['data'][e];
            if(firstDate === 0 && (stuff['bAmt'] > 0 || stuff['sAmt'] > 0)){
                let thisDate = returnDate(e);
                if(thisDate['thisY'] > sY) sY = thisDate['thisY'];
                if(thisDate['thisM'] !== sM) sM = thisDate['thisM'];
                firstDate = e;
            }
            
            buyArr[idx] = stuff['bPrice'];
            sellArr[idx] = stuff['sPrice'];
        });
        function returnDate(str){
            let thisDate = str.split('-');
            let thisY = Number(thisDate[0]), thisM = Number(thisDate[1]) -1;
            return {thisY : thisY, thisM : thisM};
        }

        function chkEmpty(arr){
            for(let i = 0; i < arr.length; i ++){
                if(!arr[i]){
                    arr[i] = null;
                }
            }
        }
        chkEmpty(buyArr);
        chkEmpty(sellArr);

        Highcharts.chart('container', {
            chart:{
                events: {
                    render: function(){
                  const chart = this,
                        startX = chart.xAxis[0].toPixels(1262304000000),
                        startY = chart.yAxis[0].toPixels(5000),
                        endX = chart.xAxis[0].toPixels(1262476800000),
                        endY = chart.yAxis[0].toPixels(200000);
            
                    if(chart.myLine){
                        chart.myLine.destroy();
                    }
                    chart.myLine = chart.renderer.path(['M',startX, startY, 'L', endX,endY])
                    .attr({'stroke-width': 2, stroke: 'red', dashstyle: 'ShortDash'}).add();
                    }
                }
            },
            //제목
            title: {
                text: '매수매도단가 추이',
                align: 'left'
            },
            //y축
            yAxis: {
                title: {
                    text: '단가'
                }
            },
        
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats:{
                    month: '%b \'%y',
                }
            },
            
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },
            
            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: true,
                    },
                    connectNulls: true,
                    pointStart: Date.UTC(sY, sM),
                    pointInterval: (24 * 3600 * 1000 * 365) / 12 //1개월 간격
                }
            },
        
            series: [{
                name: '매수',
                data: buyArr,
            }, {
                name: '매도',
                data: sellArr,
            }],
        
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }
        
        });
        
        return new Promise(resolve => resolve());
    },
    /**
     * datas['summary']에 데이터 취합
     * @param {*} period 
     * @returns 
     */
    getSummary : async function(period){
        let detailInfo = await cmnEx.calBasicInfo(period);
        
        if(period){
            datas['summaryPrd'] = detailInfo;
        } else {
            datas['summary'] = detailInfo;
        }
        return new Promise(resolve => resolve(detailInfo));
    },
    /**
     * getSummary 내부동작용.
     * @param {*} period 
     * @returns 
     */
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
            
            let assetInfo = datas['myAssetInfo']['shareList'].filter(x => x.assetNm === assetNm)[0] ?? {assetTotprice : 0, assetNowTotal : 0};
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
                if(assetInfo['assetNowTotal'] && typeof(assetInfo['assetNowTotal']) === 'string'){
                    assetInfo['assetNowTotal'] = Number((assetInfo?.['assetNowTotal']).replaceAll(',', ''));
                }
                if(assetInfo['assetTotprice'] && typeof(assetInfo['assetTotprice']) === 'string'){
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

    /**
     * 배당금정보 가져오기 datas['summaryDividend'] datas['summaryDividendPrd']
     * @param {*} period 
     * @returns 
     */
    getDividendInfo : async function(period){
        if(period){
            datas['diviInfoPrd'] = datas['trInfoPeriod']['voList'].filter(x => x.trMethod === '배당금 입금');
            makeDividinfo(datas['diviInfoPrd'], period);
        }else {
            datas['dividendInfo'] = datas['trInfo']['voList'].filter(x => x.trMethod === '배당금 입금');
            makeDividinfo(datas['dividendInfo']);
        }
        
        return new Promise(resolve => resolve());
    },
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

async function fetchDataOut(type = 'GET', url = '', data = {} ){
    let opt = {
        method: type, // *GET, POST, PUT, DELETE 등
        headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://finance.naver.com',
        'Access-Control-Allow-Headers' : 'Content-Type',
        'origin' : 'https://finance.naver.com',
        },
        body: JSON.stringify(data), // body의 데이터 유형은 반드시 'Content-Type' 헤더와 일치해야 함
    }
    if(type.toLowerCase().includes("get")){
        delete opt.body;
    }
    const response = await fetch(url, opt);
    return response.json(); // JSON 응답을 네이티브 JavaScript 객체로 파싱
}
function strToNum(obj){
    Object.keys(obj).forEach(key => {
        if(key !== 'assetNm'){
            obj[key] = Number(obj[key]);
        }
    })
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
/**
 * 월 시작일 마지막일 얻기
 * @param {number} y :연도
 * @param {number} m :월
 * @returns object{year, month, fDay, lDay}
 */
function getFLDay(y, m){
    let month = Number(m) - 1;
    let firstDay = new Date(y, month, 1);
    let lastDay = new Date(y, month +1 , 0);
    firstDay = firstDay.getDate();
    lastDay = lastDay.getDate();

    let paramData = {
        year : y,
        month : month,
        fDay : firstDay,
        lDay : lastDay
    }

    return paramData;
}

/**
 * 월별 거래내역 정보 db에 업데이트. (거래내역에서 달력날짜 선택: 월초, 월말)
 */
async function makeForHist(){
    let stdt = document.getElementsByClassName('datepicker-input')[0]['value'] ?? '';
    let enddt = document.getElementsByClassName('datepicker-input')[1]['value'] ?? '';
    
    stdt = stdt.split('/');
    enddt = enddt.split('/');
    let y = Number(stdt[0]);
    let m = Number(stdt[1]);
    let dayInfo = getFLDay(y, m);

    stdt[2] = dayInfo['fDay'];
    enddt[2] = dayInfo['lDay'];

    stdt = stdt.join('/');
    enddt = enddt.join('/');

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
                Object.keys(paramData).forEach(x => {
                    paramData[x] = paramData[x].toString();
                })
                datas['test'].push(paramData);
                let chkExist = datas['trInfoPeriod']['voList'].filter(x => x.assetNm === e['assetNm']).map(m => m.assetNm);
                chkExist = [...new Set(chkExist)];

                datas['trHist'] = await fetchData('POST', 'getTrHistInfo', {histPeriodStart : stdt, histPeriodEnd : enddt, assetNm : chkExist[0]});
                let histNo = datas['trHist']['voList']?.[0]?.['histNo'] ?? null;
                console.log(histNo);
                if(histNo){
                    console.log('이미 등록된 구간입니다.');
                    await fetchData('POST', 'updateTrHist', paramData);
                } else {
                    await fetchData('POST', 'writeTrHist', paramData);
                }
                
            }
        })
    }
}

/** 거래내역 실제실현손익 계산 */
function calTrHist(){
    let assetNms = datas['myAssetInfo']['shareList'].map(m => m.assetNm);
    assetNms.forEach(assetNm => {
        let thisAssetTrHist = datas['allTrHist']['voList'].filter(x => x.assetNm === assetNm);
        if(thisAssetTrHist.length > 0){
            let forHist = new Array();
            let globalAmt = 0, globalPrc = 0, globalTot = 0, gRealProfit = 0, totArr = new Array();
            thisAssetTrHist.forEach((e, idx) => {
                let tr = document.createElement('tr');
                let aNm = e['assetNm'];
                let amt = Number(e['assetAmt']);
                let prc = Number(e['assetPrice']);
                let tot = Number(e['assetTotprice']);
                let rslt = Number(e['trResult']);
                totArr.push(tot);

                globalAmt += amt;
                globalTot += tot;
                globalPrc = Math.round(globalTot/globalAmt);
                if(isNaN(globalPrc)) globalPrc = 0;
                
                let temp = {
                    assetNm : e['assetNm'],
                    amt : amt, prc : prc, tot : tot, rslt : rslt, date:e['histPeriodEnd'],
                    gAmt : globalAmt, gPrc : globalPrc, gTot : globalTot
                }
                //수정매수단가 계산
                if(amt > 0){
                    //증가
                    let rPrc = Math.round(tot/amt);
                    temp['rPrc'] = rPrc;
                } else if(amt < 0) {
                    let rPrc = 0, rsltR = 0;
                    rPrc = Math.round(Math.abs(tot)/Math.abs(amt));
                    
                    temp['rPrc'] = rPrc;
                    rsltR = 0;
                    // (매도단가 - 직전보유단가) * 매도수량 = 실현손익
                    let hPrc = forHist[idx - 1]['gPrc']; //직전보유단가
                    
                    if(globalAmt === 0 || isNaN(hPrc)){
                        hPrc = 0;
                        rsltR = Math.abs(globalTot);
                    } else {
                        rsltR = (rPrc - hPrc) * Math.abs(amt);
                    }
                    temp['rsltR'] = rsltR
                    gRealProfit += rsltR;
                } else if(amt === 0){
                    gRealProfit -= totArr[idx];
                    let rtot = -totArr[idx];
                    temp['rPrc'] = prc;
                    temp['rsltR'] = rtot;
                }
                //전월 수량이 줄었고 금월 매수했으며 전월 거래수량이 금월보다 클 경우
                if(idx > 0 && forHist[idx -1]['amt'] < 0 && temp['amt'] > 0 && Math.abs(forHist[idx -1]['amt']) >= Math.abs(temp['amt'])){
                    let prc2 = forHist[idx -1]['rPrc'] - prc;
                    let trRslt2 = prc2 * amt;

                    gRealProfit += trRslt2;
                    temp['rsltR'] = trRslt2;
                }
                forHist.push(temp);
            })
            let summary = datas['summary'].filter(x => x.assetNm === assetNm)[0];
            let temp2 = {assetNm : assetNm, rsltR : (gRealProfit + summary['totDividend'])};
        }
    })
}

/**
 * 개월수 차이 얻기
 * @param {Date} d1 : 날짜1
 * @param {Date} d2 : 날짜2
 * @returns number : 개월차이
 */
function inMonths(d1, d2) {
    var d1Y = d1.getFullYear();
    var d2Y = d2.getFullYear();
    var d1M = d1.getMonth();
    var d2M = d2.getMonth();

    return (d2M+12*d2Y)-(d1M+12*d1Y);
}


function sortTrSummary(){
    let tg = datas['sumData'];

    sortArr(datas['sumData'], 'des', 'printResult');
    sortArr(datas['sumData'], 'asc', 'state');
    let trResults = datas['sumData'].map(x => x.result);
    cmnEx.makeTrSummaryHTML(trResults);
}

function sortArr(arr, type, target){
    arr.sort(function(a, b){
        a = a['result'][target];
        b = b['result'][target];
        if(type.includes('des')){
            if(a > b) return -1;
            else if(a < b) return 1;
            else return 0;
        }
        else if(type.includes('asc')){
            if(a > b) return 1;
            else if(a < b) return -1;
            else return 0;
        }
    })
}

async function getSise(assetNm, stdt = '', eddt = ''){
    let cd = await fetchData('POST', 'getStockCode', {assetNm : assetNm});
    cd = cd.cd;
    console.log(cd);
    let today = new Date();
    if(!stdt){
        stdt = new Date('2020').toISOString().split('T')[0].replaceAll('-','');
    }
    if(!eddt){
        eddt = today.toISOString().split('T')[0].replaceAll('-','');
    }
    let res = await fetch(`https://api.finance.naver.com/siseJson.naver?symbol=${cd}&requestType=1&startTime=${stdt}&endTime=${eddt}&timeframe=day`);
    datas['naverRes'] = await res.text();
    datas['naverRes'] = datas.naverRes.replaceAll('\'','\"');
    datas['naverRes'] = JSON.parse(datas['naverRes']);

    //받아온 데이터 저장
    let cols = datas['naverRes'].splice(0, 1);
    
    let toWork = [];
    datas['naverRes'].forEach(e => {
        let obj = {
            assetNm : assetNm,
            date : e[0],
            stPrice : e[1],
            hiPrice : e[2],
            loPrice : e[3],
            edPrice : e[4],
            trAmt : e[5]
        }
        toWork.push(obj);
    })
    console.log(toWork);

    let param = {list : toWork};
    let result = await fetchData("POST", "pushSise", param);
    delete datas['naverRes'];

}

function getLatestSise(){
    datas['latestSises'] = [];
    datas['assetNms'].forEach(async e => {
        let result = await fetchData("POST", "getStockData", {assetNm : e});
        datas['latestSises'].push(result);
    })
}

function setEachMonthData(){
    let param = {assetNms : datas['assetNms']};
    fetchData("POST", "setEachMonthData", param);
}

async function getEachMonthData(assetNm){
    let param = {assetNm : assetNm};
    let list = await fetchData("POST", "getEachMonthData", param);
    if(Object.keys(list).length === 0){
        list = new Array();
    } else {
        let needToNumber = ['amtChange', 'priceChange', 'totChange', 'trResult'];
        list = list.list;
        list.forEach(e => {
            Object.keys(e).forEach(key => {
                if(e[key] === null && !needToNumber.includes(key)) delete e[key];
                else if(needToNumber.includes(key)){
                    e[key] = Number.parseInt(e[key]);
                    if(e[key] === undefined) e[key] = 0;
                }
            })
        })
    }
    return setEachMonthAsset(list);
}

function setEachMonthAsset(list){
    let nowAmt = 0, nowTot = 0, bfTot = 0, nowResult = 0, voList = [], needRecoverIdx = [], recoverCloseIdx = [], recoveringIdx = [];
    needRecoverAmt = 0, needRecoverTot = 0, recoveredAmt = 0, recoveredTot = 0, recoverResult = 0, recoverResultTot = 0;
    if(list.length > 0){
        list.forEach((e, idx) => {
            let vo = {};
            vo.assetNm = e.assetNm;
            vo.trDate = e.trDate;
            nowAmt += e.amtChange;
            nowTot += e.totChange;
            nowResult += Number.isNaN(e.trResult) ? 0 : e.trResult;
            vo.trAmt = nowAmt;
            vo.trTotPrice = nowTot;
            vo.trResult = nowResult + recoverResultTot;
            
            /*보유중 매도 발생. needRecover*/
            if(e.amtChange < 0){
                vo.state = 'needRecover';
                needRecoverAmt += Math.abs(e.amtChange);
                needRecoverTot += Math.abs(e.totChange); 
                vo.needRecoverAmt = needRecoverAmt;
                vo.needRecoverTot = needRecoverTot;
                needRecoverIdx.push(idx);
            } else if(e.amtChange === 0 && e.trResult != 0) {
                /*수량변동 없이 매매만 발생*/
                vo.state = 'squeezing';
                console.log(`bfTot : nowTot = ${bfTot} : ${nowTot}, 차익 : ${bfTot - nowTot}`); 
                //이것도 일종의 당월 리커버링의 한 종류이므로 recoverResultTot에 포함한다.
                recoverResultTot += bfTot - nowTot;
            } else {
                let filteredNeed = needRecoverIdx.filter(x => x < idx);
                
                let isRecover = filteredNeed.length > 0 && filteredNeed[filteredNeed.length -1] < idx && needRecoverAmt > 0? true : false;
                if(Math.abs(e.amtChange) < Math.abs(needRecoverAmt) && isRecover){
                    console.log(`${e.trDate} recovoering amtChange:${e.amtChange} , needRecoverAmt:${needRecoverAmt}`)
                    /*recovering*/
                    needRecoverAmt -= e.amtChange;
                    needRecoverTot -= e.totChange;
                    recoveredTot -= e.totChange;
                    vo.state = 'recovering';
                    recoveringIdx.push(idx);
                    vo.needRecoverAmt = needRecoverAmt;
                    vo.needRecoverTot = needRecoverTot;
                } else if(Math.abs(e.amtChange) >= Math.abs(needRecoverAmt) && isRecover){
                    /*recover close*/
                    let finalRecovered = e.priceChange * needRecoverAmt;
                    recoverResult = needRecoverTot - (finalRecovered + recoveredTot);
                    recoverResultTot += recoverResult;

                    vo.trResult += recoverResult;
                    vo.recoverResult = recoverResult;
                    recoverResult = 0;

                    needRecoverAmt -= e.amtChange;
                    needRecoverTot -= e.totChange;
                    
                    if(needRecoverAmt < 0){
                        needRecoverAmt = 0, needRecoverTot = 0, recoveredTot = 0;
                    }
                    
                    vo.state = 'recover close';
                    recoverCloseIdx.push(idx);
                    needRecoverIdx = [];
                }

                else{
                    /*매집*/
                vo.state = 'collecting';
                }
            }

            bfTot = nowTot;
            //console.log(vo);
            voList.push(vo);
        })

        console.log(voList);
    }

    return list;
}
