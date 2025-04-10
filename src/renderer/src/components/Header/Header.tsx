const Header = ({ userName, pageName }) => {
    return (
        <div className="headerPrimary" >
            <div style={{ fontSize: "1.1rem", fontWeight: "700" }}>
                {pageName}
            </div>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1rem", paddingBottom: "1px", fontWeight: "700" }}>
                    {userName}
                </div>
                <div style={{ fontSize: "0.6rem", fontWeight: "700", color: "#f8d20f" }}>
                    {
                        localStorage.getItem("roleId") === "1" ? "Admin" : "Agent"
                    }
                </div>
            </div>
        </div>
    )
}

export default Header