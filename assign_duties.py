import pandas as pd
import random
from collections import Counter

def assign_duties(input_file='result.csv', output_file='final_result.csv'):
    """
    학생들의 학급 자치 부서를 배정하는 함수

    - 이전에 했던 부서는 다시 배정하지 않음
    - 각 부서별 인원을 최대한 균등하게 분배
    """
    try:
        df = pd.read_csv(input_file)
    except FileNotFoundError:
        print(f"오류: '{input_file}'을 찾을 수 없습니다. 파일 경로를 확인해주세요.")
        return

    departments = ['환경부', '친구사랑부', '체육안전부', '살림부', '학습부']
    total_students = len(df)
    
    # 월별 컬럼 정의
    periods = ['3-4월', '5-6월', '7-8월', '9-10월', '11-12월']
    periods_to_assign = ['7-8월', '9-10월', '11-12월']

    # NaN 값을 빈 문자열로 대체하여 오류 방지
    for period in periods:
        if period in df.columns:
            df[period] = df[period].fillna('')

    for period in periods_to_assign:
        if period not in df.columns:
            df[period] = ''
        
        # 해당 월의 부서별 인원 수 카운트
        dept_counts = Counter(df[period].tolist())
        
        # 학생들을 순회하며 부서 배정
        for i in range(total_students):
            # 이미 배정된 학생은 건너뛰기
            if df.at[i, period] != '':
                continue

            # 학생이 이전에 배정되었던 부서 목록
            assigned_duties = df.loc[i, periods].values.tolist()
            
            # 선택 가능한 부서 목록
            available_depts = [d for d in departments if d not in assigned_duties]
            
            if not available_depts:
                # 모든 부서를 이미 다 경험한 경우, 경고 메시지 출력 후 가능한 부서 중 하나로 배정
                print(f"경고: {df.at[i, '이름']} 학생은 모든 부서를 이미 경험했습니다. 중복 배정이 필요합니다.")
                # 이 경우, 해당 월에 가장 인원이 적은 부서로 배정
                min_count_dept = min(dept_counts, key=dept_counts.get)
                chosen_dept = min_count_dept
            else:
                # 선택 가능한 부서들 중에서, 현재 월에 가장 인원이 적은 부서를 선택
                available_dept_counts = {d: dept_counts.get(d, 0) for d in available_depts}
                min_count = min(available_dept_counts.values())
                candidates = [d for d, count in available_dept_counts.items() if count == min_count]
                
                # 최소 인원 부서가 여러 개일 경우, 그 중 하나를 무작위로 선택
                chosen_dept = random.choice(candidates)

            df.at[i, period] = chosen_dept
            dept_counts[chosen_dept] += 1
            
    # 번호' 컬럼 기준으로 정렬
    if '번호' in df.columns:
        df = df.sort_values(by='번호').reset_index(drop=True)

    # 결과 저장
    df.to_csv(output_file, index=False, encoding='utf-8-sig')
    print(f"배정이 완료되었습니다. 결과가 '{output_file}' 파일에 저장되었습니다.")
    print("\n최종 배정 결과:")
    print(df)

if __name__ == '__main__':
    assign_duties() 