function Footer() {
  return (
    <footer className="admin-footer">
      <div className="container-fluid px-3 px-lg-4">
        <span>
          Copyright &copy; 2026 Team PetroHub  <br /> 
        </span>
        <span>Developed by{" "}
          <a
            target="_blank"
            className="fw-bold text-success"
            href="https://www.linkedin.com/in/dona-bhattacharjee-2a509b234"
          >
            Dona Bhattacharjee
          </a>{" "}
          • {" "}
          <a
            target="_blank"
            className="fw-bold text-success"
            href="https://www.linkedin.com/in/saoni-saha-129508198/">
            Saoni Saha
          </a>{" "}
          • {" "}
          <a
            target="_blank"
            className="fw-bold text-success"
            href="https://github.com/itzcopycat"
          >
            Sibam Dutta
          </a>
          </span>
      </div>
    </footer>
  );
}

export default Footer;