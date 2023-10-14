export default async function twPage() {
  async function getData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("hello");
      }, 3000);
    });
  }
  await getData();
  return (
    <div>
      <div className="k-btn-red k-btn">sadsda</div>
      <div>
        <span className="w-5 h-5 i-mdi-uber"></span>
      </div>
    </div>
  );
}
