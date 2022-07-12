%define anolis_release 1

Name:           keentune-ui
Version:        1.3.0
Release:        %{?anolis_release}%{?dist}
Url:            https://gitee.com/anolis/keentune_ui
Summary:        KeenTune web UI
Vendor:         Alibaba
License:        MulanPSLv2
Source:         https://gitee.com/anolis/keentune_ui/repository/archive/%{name}-%{version}.tar.gz
BuildArch:      noarch

%description
KeenTune UI rpm package

%prep
%setup -n %{name}-%{version}

%install
mkdir -p ${RPM_BUILD_ROOT}/etc/keentune/
mkdir -p ${RPM_BUILD_ROOT}/etc/keentune/html
cp -rf build ${RPM_BUILD_ROOT}/etc/keentune/html

%clean
[ "$RPM_BUILD_ROOT" != "/" ] && rm -rf "$RPM_BUILD_ROOT"
rm -rf $RPM_BUILD_DIR/%{name}-%{version}


%files
%defattr(0644,root,root, 0755)
%license LICENSE
%dir %{_sysconfdir}/keentune
%dir %{_sysconfdir}/keentune/html



%changelog
* Tue Jul 12 2022  Pengtao Jia <wb-jpt471562@alibaba-inc.com> - 1.3.0
- Add: UI support One-click Expert Tuning
