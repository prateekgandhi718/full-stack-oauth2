import React from "react";
import { LoginCallback } from "@okta/okta-react";
import { Routes, Route, Outlet } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import SelectDealPage from "./SelectDealPage";
import Loading from "./Loading";
import Unauthorized from "./Unauthorized";
import NotFound404 from "./NotFound404";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";

function AppRouter() {
  return (
    <React.Suspense fallback={<span>Loading.....suspense...</span>}>
      <Routes>
        <Route
          path="/login/callback"
          element={<LoginCallback loadingElement={<Loading />} />}
        />
        <Route
          path=""
          element={<ProtectedRoute rolesPermissions={undefined} />}
        >
          <Route path="/" element={<Layout />}>
            <Route index element={<SelectDealPage />} />

            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Using path="*"" means "match anything", so this route
              acts like a catch-all for URLs that we don't have explicit
              routes for. */}
            <Route path="*" element={<NotFound404 />} />
          </Route>
        </Route>
      </Routes>
    </React.Suspense>
  );
}

export default AppRouter;

function Layout() {
  const theme = useTheme();
  return (
    <Box
      sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", height: "100%" }}
    >
      <AppBar
        elevation={1}
        position="relative"
        sx={{ zIndex: theme.zIndex.appBar }}
        color="inherit"
      >
        <Toolbar>
          <Box sx={{ marginLeft: "32px", pointerEvents: "none" }}>
            <Typography>Logo</Typography>
          </Box>
          <Box
            marginLeft={"44px"}
            display={"flex"}
            flexDirection={"row"}
            gap={4}
          >
            <Button href={"/"}>
              <Typography variant="body1" textAlign={"center"}>
                Pricing
              </Typography>
            </Button>
            <Button href={"/"}>
              <Typography variant="body1" textAlign={"center"}>
                Portfolio
              </Typography>
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false}>
        <Box sx={{ paddingLeft: "144px", paddingRight: "144px" }}>
          <Outlet />
        </Box>
      </Container>
    </Box>
  );
}
