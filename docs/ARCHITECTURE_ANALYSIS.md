# Architecture & Technical Analysis

## 1. การบูรณาการ Symbolic และ Numerical (The Hybrid Bottleneck)
การแปลงสมการเชิงสัญลักษณ์ (AST) ไปเป็นการคำนวณแบบ Array-based (เช่น NumPy) มักจะมีคอขวดที่กระบวนการ `lambdify` หรือการแปลงโครงสร้างต้นไม้คณิตศาสตร์ให้เป็น Machine Code หรือ Bytecode ที่ทำงานได้เร็ว หากข้อมูลมีขนาดหลักล้านแถว การประเมินค่าฟังก์ชันนี้ซ้ำๆ ต้องใช้วิธี Vectorization ที่มีประสิทธิภาพ

## 2. การสร้าง Parser สำหรับคณิตศาสตร์
การให้ผู้ใช้พิมพ์ `f(x) = x^2 sin(x)` จำเป็นต้องมีกลไกการตีความ (Parser) ที่ฉลาดพอจะแยกแยะตัวแปรและฟังก์ชันมาตรฐาน ซึ่งการเขียน Parser เองทั้งหมดอาจมีความซับซ้อนสูง ควรพิจารณาใช้เครื่องมือที่มีอยู่แล้ว (เช่น `sympy.parse_expr` ใน Python หรือ `mathjs` ใน JavaScript)

## 3. การคำนวณ Uncertainty Propagation
การใช้สูตร `σ_z² ≈ (∂z/∂x σₓ)² + (∂z/∂y σᵧ)²` จำเป็นต้องหาอนุพันธ์ย่อย (Partial Derivatives) เชิงสัญลักษณ์สำหรับทุกตัวแปรอิสระ ยิ่งฟังก์ชันซับซ้อน จำนวนเทอมจะขยายแบบทวีคูณ (Expression Swell) ต้องมีกลไก Simplification ที่แข็งแกร่งก่อนนำไปแทนค่าตัวเลข

## 4. ความท้าทายด้าน UI (State Management)
เนื่องจากระบบเป็น "Interactive" การเปลี่ยนพารามิเตอร์ A ในสมการ 1 ตัว อาจส่งผลให้ต้องคำนวณ อนุพันธ์, ราก, กราฟ, และโมเดลที่พึ่งพามันใหม่ทั้งหมด (Reactivity) โครงสร้างของ State Management จึงต้องเป็นแบบ DAG (Directed Acyclic Graph) เพื่อไล่ลำดับการคำนวณใหม่เฉพาะส่วนที่ได้รับผลกระทบเท่านั้น (คล้ายกลไกของ Spreadsheet)

## 5. เทคโนโลยีที่เหมาะสม (Tech Stack Recommendations)
- **Backend-heavy (Python):** Python (SymPy, NumPy, SciPy) + Web UI (Dash / Streamlit / FastAPI + React). ข้อดีคือไลบรารีครบ แต่ข้อเสียคือเรื่อง Latency เวลาปรับ Slider บน UI อาจจะช้ากว่าเพราะต้องสื่อสารผ่าน Network
- **Frontend-heavy (Web-native):** React + WebAssembly (Pyodide เพื่อรัน Python ในเบราว์เซอร์) หรือใช้ Math.js + อัลกอริทึมเขียนเอง ข้อดีคือ Interactive ลื่นไหลมาก (Zero latency) แต่ข้อเสียคือการคำนวณสัญลักษณ์ซับซ้อนอาจจะใช้ทรัพยากรเบราว์เซอร์เยอะ
- **Desktop App:** C++ / Qt + Python bindings หรือ Electron + Python backend
