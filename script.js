document.addEventListener('DOMContentLoaded', () => {
    const periodSelect = document.getElementById('period-select');
    const startDrawButton = document.getElementById('start-draw-button');
    const resultsContainer = document.getElementById('results-container');

    let studentData = [];
    let periods = [];
    let allDepartments = [];
    let currentStudentIndex = 0;

    // CSV 데이터 로드 및 파싱
    async function loadData() {
        try {
            const response = await fetch('data/final_result.csv');
            const csvText = await response.text();
            
            const rows = csvText.trim().split('\n').map(row => row.split(','));
            
            const headers = rows[0];
            periods = headers.slice(2); // '번호', '이름' 제외

            studentData = rows.slice(1).map(row => {
                const student = {};
                headers.forEach((header, index) => {
                    student[header] = row[index];
                });
                return student;
            });

            // 모든 부서 목록 추출
            const departmentsSet = new Set();
            studentData.forEach(student => {
                periods.forEach(period => {
                    departmentsSet.add(student[period]);
                });
            });
            allDepartments = Array.from(departmentsSet);

            populatePeriodSelect();
        } catch (error) {
            console.error('CSV 파일을 불러오는 데 실패했습니다.', error);
            resultsContainer.textContent = '오류: 데이터를 불러올 수 없습니다. final_result.csv 파일이 data 폴더에 있는지 확인해주세요.';
        }
    }

    // 기간 선택 드롭다운 채우기
    function populatePeriodSelect() {
        periods.forEach(period => {
            const option = document.createElement('option');
            option.value = period;
            option.textContent = period;
            periodSelect.appendChild(option);
        });
        periodSelect.addEventListener('change', resetDraw);
    }

    // 뽑기 상태 초기화
    function resetDraw() {
        currentStudentIndex = 0;
        resultsContainer.innerHTML = '';
        startDrawButton.disabled = false;
        startDrawButton.textContent = '뽑기 시작!';
    }

    // 뽑기 시작! 버튼 클릭 시 한 명씩 뽑기
    startDrawButton.addEventListener('click', () => {
        const selectedPeriod = periodSelect.value;
        if (!selectedPeriod || studentData.length === 0 || currentStudentIndex >= studentData.length) {
            return;
        }

        const student = studentData[currentStudentIndex];
        showStudentResult(student, selectedPeriod);
        currentStudentIndex++;

        if (currentStudentIndex >= studentData.length) {
            startDrawButton.textContent = '모두 완료!';
            startDrawButton.disabled = true;
        }
    });

    // 개별 학생 결과 표시 및 애니메이션
    function showStudentResult(student, period) {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'student-result';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'student-name';
        nameSpan.textContent = `${student['번호']}. ${student['이름']}`;

        const slotDiv = document.createElement('div');
        slotDiv.className = 'department-slot';

        const animationDiv = document.createElement('div');
        animationDiv.className = 'slot-animation';
        
        // 애니메이션을 위한 부서 목록 생성
        // 항상 같은 순서로 보이도록 정렬
        const shuffledDepartments = [...allDepartments].sort(() => Math.random() - 0.5); 
        shuffledDepartments.forEach(dept => {
            const p = document.createElement('p');
            p.textContent = dept;
            animationDiv.appendChild(p);
        });
        // 마지막에 한 바퀴 더 돌 수 있도록 첫번째 항목을 맨 뒤에 추가
        const p = document.createElement('p');
        p.textContent = shuffledDepartments[0];
        animationDiv.appendChild(p);


        slotDiv.appendChild(animationDiv);
        resultDiv.appendChild(nameSpan);
        resultDiv.appendChild(slotDiv);
        resultsContainer.appendChild(resultDiv);

        // 스크롤을 맨 아래로 이동시켜 새로 추가된 결과를 보여줍니다.
        resultsContainer.scrollTop = resultsContainer.scrollHeight;

        // 결과 표시 영역이 부드럽게 나타나도록 함
        setTimeout(() => {
            resultDiv.classList.add('visible');
        }, 10);

        // 애니메이션 중지 및 최종 결과 표시
        setTimeout(() => {
            animationDiv.classList.add('slot-final-result');
            animationDiv.innerHTML = `<p>${student[period]}</p>`;

            // 부서가 결정되는 순간 'impact' 클래스를 추가해 애니메이션 효과를 줍니다.
            slotDiv.classList.add('impact');

            // 애니메이션이 끝나면 클래스를 제거하여 다음 뽑기에서 다시 효과가 나타나게 합니다.
            slotDiv.addEventListener('animationend', () => {
                slotDiv.classList.remove('impact');
            }, { once: true });

        }, 2000); // 2초간 애니메이션
    }

    loadData();
}); 