#!/usr/bin/env bash
# EAS Pre-Build Hook - Fixes boost pod checksum issue
# This runs on EAS servers before the build starts

set -e

echo "🔧 [EAS Hook] Fixing boost pod checksum issue..."

BOOST_PODSPEC="node_modules/react-native/third-party-podspecs/boost.podspec"

if [ -f "$BOOST_PODSPEC" ]; then
    echo "📦 Patching $BOOST_PODSPEC..."
    
    # Replace the entire podspec with corrected version
    cat > "$BOOST_PODSPEC" << 'PODSPEC'
# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

Pod::Spec.new do |spec|
  spec.name = "boost"
  spec.version = "1.83.0"
  spec.license = { :type => "Boost Software License", :file => "LICENSE_1_0.txt" }
  spec.homepage = "http://www.boost.org"
  spec.summary = "Boost provides free peer-reviewed portable C++ source libraries."
  spec.authors = "Rene Rivera"
  spec.source = {
    :http => "https://archives.boost.io/release/1.83.0/source/boost_1_83_0.tar.bz2",
    :sha256 => "6478edfe2f3305127cffe8caf73ea0176c53769f4bf1585be237eb30798c3b8e",
  }

  # Pinning to the same version as React.podspec.
  spec.platforms = min_supported_versions
  spec.requires_arc = false

  spec.module_name = "boost"
  spec.header_dir = "boost"
  spec.preserve_path = "boost"
end
PODSPEC
    
    echo "✅ boost.podspec patched successfully"
    echo "📋 Checksum: 6478edfe2f3305127cffe8caf73ea0176c53769f4bf1585be237eb30798c3b8e"
else
    echo "⚠️  boost.podspec not found at $BOOST_PODSPEC"
    exit 1
fi

echo "✨ Pre-build hook completed"
